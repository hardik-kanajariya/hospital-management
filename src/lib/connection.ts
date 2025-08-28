// Database connection management for offline-first operations
import { apiService } from './api'

interface ConnectionConfig {
  host: string
  port: number
  database: string
  username: string
  password: string
}

interface SyncConflict {
  id: string
  table: string
  recordId: string
  localData: any
  serverData: any
  timestamp: string
}

class ConnectionManager {
  private config: ConnectionConfig | null = null
  private isOnline: boolean = navigator.onLine
  private syncInProgress: boolean = false
  private retryCount: number = 0
  private maxRetries: number = 3
  private retryDelay: number = 5000 // 5 seconds

  constructor() {
    this.setupEventListeners()
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.handleOnline()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.handleOffline()
    })

    // Listen for page visibility changes to sync when app becomes active
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.attemptSync()
      }
    })
  }

  private handleOnline() {
    console.log('Connection restored, attempting sync...')
    this.retryCount = 0

    // Debounce sync to prevent multiple rapid syncs
    setTimeout(() => {
      if (this.isOnline) {
        this.attemptSync()
      }
    }, 2000)
  }

  private handleOffline() {
    console.log('Connection lost, entering offline mode...')
    this.syncInProgress = false
  }

  async setConfig(config: ConnectionConfig) {
    this.config = config
    return this.testConnection()
  }

  async testConnection(): Promise<boolean> {
    if (!this.isOnline) return false

    try {
      const response = await fetch('/api/health-check', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`
        }
      })
      return response.ok
    } catch (error) {
      console.error('Connection test failed:', error)
      return false
    }
  }

  private async attemptSync() {
    if (this.syncInProgress || !this.isOnline) return

    this.syncInProgress = true

    try {
      await this.performFullSync()
      this.retryCount = 0
    } catch (error) {
      console.error('Sync failed:', error)
      this.handleSyncError()
    } finally {
      this.syncInProgress = false
    }
  }

  private async performFullSync() {
    // Import db here to avoid circular dependency
    const { db } = await import('./database')

    // Get all pending sync operations
    const pendingOps = await db.query('sync_queue', 'by-timestamp')
    const pending = pendingOps.filter(op => op.status === 'pending')

    console.log(`Starting sync for ${pending.length} operations`)

    for (const operation of pending) {
      try {
        await this.syncSingleOperation(operation)

        // Mark as completed
        await db.update('sync_queue', operation.id, {
          status: 'completed',
          error_message: undefined
        })
      } catch (error) {
        console.error(`Failed to sync operation ${operation.id}:`, error)

        // Update retry count and status
        const newRetryCount = operation.retry_count + 1
        await db.update('sync_queue', operation.id, {
          retry_count: newRetryCount,
          status: newRetryCount >= this.maxRetries ? 'failed' : 'pending',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Pull latest data from server
    await this.pullServerUpdates()
  }

  private async syncSingleOperation(operation: any) {
    const { table_name, operation: op, data, record_id } = operation

    let endpoint = `/api/${table_name.replace('_', '-')}`
    let method = 'POST'

    switch (op) {
      case 'create':
        method = 'POST'
        break
      case 'update':
        method = 'PUT'
        endpoint = `${endpoint}/${record_id}`
        break
      case 'delete':
        method = 'DELETE'
        endpoint = `${endpoint}/${record_id}`
        break
    }

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiService.getToken()}`
      },
      body: op !== 'delete' ? JSON.stringify(data) : undefined
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }

    // For successful operations, update local record sync status
    if (op !== 'delete') {
      const { db } = await import('./database')
      await db.update(table_name as any, record_id, {
        synced: true,
        local_changes: false
      })
    }

    return response.json()
  }

  private async pullServerUpdates() {
    const tables = [
      'patients', 'appointments', 'medical_records',
      'billing', 'inventory', 'lab_tests', 'beds', 'doctors'
    ]

    for (const table of tables) {
      try {
        await this.syncTableFromServer(table)
      } catch (error) {
        console.warn(`Failed to sync ${table} from server:`, error)
      }
    }
  }

  private async syncTableFromServer(tableName: string) {
    const { db } = await import('./database')

    // Get last sync timestamp for this table
    const lastSyncMeta = await db.get('metadata', `last_sync_${tableName}`)
    const lastSync = lastSyncMeta?.value || new Date(0).toISOString()

    const endpoint = `/api/${tableName.replace('_', '-')}?updated_since=${lastSync}`

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${apiService.getToken()}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch ${tableName}: ${response.status}`)
    }

    const result = await response.json()
    const serverData = result.data || []

    for (const serverRecord of serverData) {
      await this.mergeServerRecord(tableName, serverRecord)
    }

    // Update last sync timestamp
    await db.create('metadata', {
      key: `last_sync_${tableName}`,
      value: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  }

  private async mergeServerRecord(tableName: string, serverRecord: any) {
    const { db } = await import('./database')

    const localRecord = await db.get(tableName as any, serverRecord.id)

    if (!localRecord) {
      // New record from server
      await db.create(tableName as any, {
        ...serverRecord,
        synced: true,
        local_changes: false
      })
    } else if (!localRecord.local_changes) {
      // Update if server record is newer and no local changes
      const serverTime = new Date(serverRecord.updated_at).getTime()
      const localTime = new Date(localRecord.updated_at).getTime()

      if (serverTime > localTime) {
        await db.update(tableName as any, serverRecord.id, {
          ...serverRecord,
          synced: true,
          local_changes: false
        })
      }
    } else {
      // Conflict: both local and server have changes
      await this.handleSyncConflict(tableName, localRecord, serverRecord)
    }
  }

  private async handleSyncConflict(tableName: string, localRecord: any, serverRecord: any) {
    console.warn('Sync conflict detected:', {
      table: tableName,
      recordId: localRecord.id,
      localTime: localRecord.updated_at,
      serverTime: serverRecord.updated_at
    })

    // For now, prefer local changes (last-write-wins from client perspective)
    // In a production system, you might want to:
    // 1. Show conflict resolution UI
    // 2. Merge non-conflicting fields
    // 3. Use business rules to resolve conflicts

    // Store conflict for potential manual resolution
    const { db } = await import('./database')
    await db.create('metadata', {
      key: `conflict_${tableName}_${localRecord.id}_${Date.now()}`,
      value: {
        table: tableName,
        recordId: localRecord.id,
        localData: localRecord,
        serverData: serverRecord,
        timestamp: new Date().toISOString(),
        resolved: false
      },
      updated_at: new Date().toISOString()
    })

    // Keep local version for now
    console.log('Keeping local version due to conflict')
  }

  private handleSyncError() {
    this.retryCount++

    if (this.retryCount < this.maxRetries) {
      console.log(`Sync failed, retrying in ${this.retryDelay}ms (attempt ${this.retryCount}/${this.maxRetries})`)

      setTimeout(() => {
        if (this.isOnline) {
          this.attemptSync()
        }
      }, this.retryDelay * this.retryCount) // Exponential backoff
    } else {
      console.error('Max sync retries exceeded')
    }
  }

  // Public methods
  isConnected(): boolean {
    return this.isOnline
  }

  isSyncing(): boolean {
    return this.syncInProgress
  }

  async forcSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline')
    }

    this.retryCount = 0
    await this.attemptSync()
  }

  async getSyncConflicts(): Promise<SyncConflict[]> {
    const { db } = await import('./database')
    const conflicts = await db.getAll('metadata')

    return conflicts
      .filter(item => item.key.startsWith('conflict_') && !item.value.resolved)
      .map(item => ({
        id: item.key,
        table: item.value.table,
        recordId: item.value.recordId,
        localData: item.value.localData,
        serverData: item.value.serverData,
        timestamp: item.value.timestamp
      }))
  }

  async resolveConflict(conflictId: string, resolution: 'local' | 'server'): Promise<void> {
    const { db } = await import('./database')
    const conflict = await db.get('metadata', conflictId)

    if (!conflict) {
      throw new Error('Conflict not found')
    }

    const { table, recordId, localData, serverData } = conflict.value

    if (resolution === 'server') {
      // Accept server version
      await db.update(table as any, recordId, {
        ...serverData,
        synced: true,
        local_changes: false
      })
    }
    // If resolution is 'local', we keep the current local version
    // and it will be synced to server on next sync

    // Mark conflict as resolved
    await db.update('metadata', conflictId, {
      ...conflict,
      value: {
        ...conflict.value,
        resolved: true,
        resolution,
        resolved_at: new Date().toISOString()
      }
    })
  }

  async getStats() {
    const { db } = await import('./database')
    const pendingOps = await db.query('sync_queue', 'by-timestamp')
    const pending = pendingOps.filter(op => op.status === 'pending')
    const failed = pendingOps.filter(op => op.status === 'failed')
    const conflicts = await this.getSyncConflicts()

    return {
      isOnline: this.isOnline,
      isSyncing: this.syncInProgress,
      pendingOperations: pending.length,
      failedOperations: failed.length,
      conflicts: conflicts.length,
      retryCount: this.retryCount
    }
  }
}

export const connectionManager = new ConnectionManager()
export default ConnectionManager