// Simplified connection manager that works with the main database instance
import { db } from './database';
import { toast } from 'sonner';

interface SyncConflict {
  id: string
  table: string
  recordId: string
  localData: any
  serverData: any
  timestamp: string
}

class ConnectionManager {
  private isOnline: boolean = navigator.onLine
  private syncInProgress: boolean = false

  constructor() {
    this.setupEventListeners()
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      console.log('Connection restored')
      toast.success('Back online - you can now continue working')
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      console.log('Connection lost - application requires internet connection')
      toast.error('Internet connection lost - please check your connection')
    })
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
      throw new Error('Cannot sync while offline - internet connection is required')
    }

    if (!db.isInitialized()) {
      throw new Error('Database not initialized')
    }

    // In online-only mode, no sync is needed - data is always current
    console.log('Online-only mode - no sync required')
  }

  async getSyncConflicts(): Promise<SyncConflict[]> {
    // Simplified - no conflicts in this implementation
    return []
  }

  async resolveConflict(conflictId: string, resolution: 'local' | 'server'): Promise<void> {
    console.log(`Conflict resolution not implemented in simplified version`)
  }

  async getStats() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.syncInProgress,
      dbInitialized: db.isInitialized(),
      lastCheck: new Date().toISOString(),
      pendingOperations: 0, // Always 0 in online-only mode
      offlineMode: false // Always false - offline mode disabled
    }
  }
}

export const connectionManager = new ConnectionManager()
export default ConnectionManager
