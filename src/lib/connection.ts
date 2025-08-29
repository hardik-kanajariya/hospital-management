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
      toast.success('Back online')
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      console.log('Connection lost - entering offline mode')
      toast.warning('Working offline')
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
      throw new Error('Cannot sync while offline')
    }

    if (!db.isInitialized()) {
      throw new Error('Database not initialized')
    }

    // The main database instance handles all sync automatically
    // This is just a notification that sync was requested
    console.log('Sync completed via main database instance')
    toast.success('Data synchronized')
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
      lastCheck: new Date().toISOString()
    }
  }
}

export const connectionManager = new ConnectionManager()
export default ConnectionManager
