// Database configuration and MySQL connection
class DatabaseConfig {
  private static instance: DatabaseConfig;
  private mysql: any = null;

  private constructor() { }

  static getInstance(): DatabaseConfig {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new DatabaseConfig();
    }
    return DatabaseConfig.instance;
  }

  // MySQL connection configuration
  getConfig() {
    return {
      host: import.meta.env.VITE_DB_HOST || 'localhost',
      user: import.meta.env.VITE_DB_USER || 'root',
      password: import.meta.env.VITE_DB_PASSWORD || '',
      database: import.meta.env.VITE_DB_NAME || 'medcare_rural',
      port: parseInt(import.meta.env.VITE_DB_PORT || '3306'),
      charset: 'utf8mb4',
      timezone: '+00:00',
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true
    };
  }

  // API endpoints configuration
  getApiConfig() {
    return {
      baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
      timeout: 30000,
      retries: 3
    };
  }
}

// Local IndexedDB for offline storage
class OfflineDatabase {
  private db: IDBDatabase | null = null;
  private dbName = 'medcare_offline';
  private version = 1;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(new Error('Failed to open IndexedDB'));

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores for each table
        const tables = [
          'patients', 'appointments', 'doctors', 'medical_records',
          'billing', 'inventory', 'lab_tests', 'beds', 'users',
          'notifications', 'sync_queue'
        ];

        tables.forEach(tableName => {
          if (!db.objectStoreNames.contains(tableName)) {
            const store = db.createObjectStore(tableName, { keyPath: 'id', autoIncrement: true });
            store.createIndex('updated_at', 'updated_at');
            store.createIndex('sync_status', 'sync_status');
          }
        });
      };
    });
  }

  async getAll(tableName: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readonly');
      const store = transaction.objectStore(tableName);
      const request = store.getAll();

      request.onerror = () => reject(new Error(`Failed to fetch ${tableName}`));
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async add(tableName: string, data: any): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const record = {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sync_status: navigator.onLine ? 'pending' : 'offline'
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readwrite');
      const store = transaction.objectStore(tableName);
      const request = store.add(record);

      request.onerror = () => reject(new Error(`Failed to add to ${tableName}`));
      request.onsuccess = () => {
        this.addToSyncQueue('create', tableName, request.result, record);
        resolve(request.result as number);
      };
    });
  }

  async update(tableName: string, id: number, data: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readwrite');
      const store = transaction.objectStore(tableName);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existingRecord = getRequest.result;
        if (!existingRecord) {
          reject(new Error('Record not found'));
          return;
        }

        const updatedRecord = {
          ...existingRecord,
          ...data,
          updated_at: new Date().toISOString(),
          sync_status: navigator.onLine ? 'pending' : 'offline'
        };

        const putRequest = store.put(updatedRecord);
        putRequest.onerror = () => reject(new Error(`Failed to update ${tableName}`));
        putRequest.onsuccess = () => {
          this.addToSyncQueue('update', tableName, id, updatedRecord);
          resolve();
        };
      };

      getRequest.onerror = () => reject(new Error(`Failed to get record from ${tableName}`));
    });
  }

  async delete(tableName: string, id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readwrite');
      const store = transaction.objectStore(tableName);
      const request = store.delete(id);

      request.onerror = () => reject(new Error(`Failed to delete from ${tableName}`));
      request.onsuccess = () => {
        this.addToSyncQueue('delete', tableName, id);
        resolve();
      };
    });
  }

  private async addToSyncQueue(operation: string, table: string, recordId: any, data?: any): Promise<void> {
    if (!this.db) return;

    const syncRecord = {
      operation,
      table,
      record_id: recordId,
      data: data || null,
      created_at: new Date().toISOString(),
      status: 'pending'
    };

    const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
    const store = transaction.objectStore('sync_queue');
    store.add(syncRecord);
  }

  async getSyncQueue(): Promise<any[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readonly');
      const store = transaction.objectStore('sync_queue');
      const request = store.getAll();

      request.onerror = () => reject(new Error('Failed to get sync queue'));
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async clearSyncQueue(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const request = store.clear();

      request.onerror = () => reject(new Error('Failed to clear sync queue'));
      request.onsuccess = () => resolve();
    });
  }
}

// API client for server communication
class ApiClient {
  private config = DatabaseConfig.getInstance().getApiConfig();
  private token: string | null = localStorage.getItem('auth_token');

  private async request(method: string, endpoint: string, data?: any): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const options: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined
    };

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${method} ${endpoint}`, error);
      throw error;
    }
  }

  async get(endpoint: string): Promise<any> {
    return this.request('GET', endpoint);
  }

  async post(endpoint: string, data: any): Promise<any> {
    return this.request('POST', endpoint, data);
  }

  async put(endpoint: string, data: any): Promise<any> {
    return this.request('PUT', endpoint, data);
  }

  async delete(endpoint: string): Promise<any> {
    return this.request('DELETE', endpoint);
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }
}

// Synchronization manager
class SyncManager {
  private offlineDb = new OfflineDatabase();
  private apiClient = new ApiClient();
  private syncInProgress = false;
  private serverAvailable = false;
  private autoSyncEnabled = true;

  async initialize(): Promise<void> {
    await this.offlineDb.initialize();

    // Check if auto-sync is enabled
    this.autoSyncEnabled = import.meta.env.VITE_AUTO_SYNC !== 'false';

    if (!this.autoSyncEnabled) {
      console.log('Auto-sync is disabled - running in offline-only mode');
      return;
    }

    // Check if server is available before starting sync
    await this.checkServerAvailability();

    // Set up online/offline event listeners
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Start sync if online and server is available
    if (navigator.onLine && this.serverAvailable) {
      this.startSync();
    }
  }

  private async checkServerAvailability(): Promise<void> {
    try {
      // Try a simple health check endpoint or any basic API call
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${this.apiClient['config'].baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeout);
      this.serverAvailable = response.ok;

      if (this.serverAvailable) {
        console.log('Server is available - sync enabled');
      } else {
        console.log('Server is not responding - running in offline mode');
      }
    } catch (error) {
      this.serverAvailable = false;
      console.log('No backend server detected - running in offline mode');
    }
  }

  private handleOnline(): void {
    if (!this.autoSyncEnabled) return;

    console.log('Connection restored');
    // Re-check server availability when coming back online
    this.checkServerAvailability().then(() => {
      if (this.serverAvailable) {
        console.log('Starting sync after reconnection');
        this.startSync();
      }
    });
  }

  private handleOffline(): void {
    console.log('Connection lost - switching to offline mode');
    this.syncInProgress = false;
  }

  async startSync(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine || !this.serverAvailable || !this.autoSyncEnabled) return;

    this.syncInProgress = true;

    try {
      // Get pending sync operations
      const syncQueue = await this.offlineDb.getSyncQueue();

      for (const operation of syncQueue) {
        await this.processSyncOperation(operation);
      }

      // Clear completed sync queue
      await this.offlineDb.clearSyncQueue();

      // Pull latest data from server
      await this.pullServerData();

    } catch (error) {
      console.error('Sync failed:', error);
      // Mark server as unavailable if sync fails
      this.serverAvailable = false;
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processSyncOperation(operation: any): Promise<void> {
    const { operation: op, table, record_id, data } = operation;

    try {
      switch (op) {
        case 'create':
          await this.apiClient.post(`/${table}`, data);
          break;
        case 'update':
          await this.apiClient.put(`/${table}/${record_id}`, data);
          break;
        case 'delete':
          await this.apiClient.delete(`/${table}/${record_id}`);
          break;
      }
    } catch (error) {
      console.error(`Failed to sync ${op} operation for ${table}:`, error);
      throw error;
    }
  }

  private async pullServerData(): Promise<void> {
    const tables = [
      'patients', 'appointments', 'doctors', 'medical_records',
      'billing', 'inventory', 'lab_tests', 'beds', 'users'
    ];

    for (const table of tables) {
      try {
        const serverData = await this.apiClient.get(`/${table}`);
        // Update local database with server data
        // Implementation depends on conflict resolution strategy
      } catch (error) {
        console.error(`Failed to pull ${table} data:`, error);
      }
    }
  }
}

// Main database class that handles both online and offline operations
export class HospitalDatabase {
  private static instance: HospitalDatabase;
  private offlineDb = new OfflineDatabase();
  private apiClient = new ApiClient();
  private syncManager = new SyncManager();
  private initialized = false;

  private constructor() { }

  static getInstance(): HospitalDatabase {
    if (!HospitalDatabase.instance) {
      HospitalDatabase.instance = new HospitalDatabase();
    }
    return HospitalDatabase.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.offlineDb.initialize();
      await this.syncManager.initialize();
      this.initialized = true;
      console.log('Hospital database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  async getAll(tableName: string): Promise<any[]> {
    if (!this.initialized) {
      throw new Error('Database not initialized. Please wait for initialization to complete.');
    }

    // Try online first, fallback to offline
    if (navigator.onLine) {
      try {
        const response = await this.apiClient.get(`/${tableName}`);

        // Handle different API response structures
        let data: any[] = [];
        if (response && response.success && response.data) {
          // New standardized response format
          if (Array.isArray(response.data)) {
            data = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            // Paginated response
            data = response.data.data;
          }
        } else if (Array.isArray(response)) {
          // Old direct array response
          data = response;
        }

        // Store in offline database for caching
        if (data.length > 0) {
          try {
            // Clear existing data and add new data
            const existingData = await this.offlineDb.getAll(tableName);
            for (const item of existingData) {
              if (item && typeof item === 'object' && item.id) {
                await this.offlineDb.delete(tableName, item.id);
              }
            }
            for (const item of data) {
              if (item && typeof item === 'object') {
                await this.offlineDb.add(tableName, { ...item, sync_status: 'synced' });
              }
            }
          } catch (offlineError) {
            console.warn('Failed to cache data offline:', offlineError);
          }
        }

        return data;
      } catch (error) {
        console.warn('API call failed, falling back to offline data:', error);
      }
    }

    // Fallback to offline data
    return this.offlineDb.getAll(tableName);
  }

  async add(tableName: string, data: any): Promise<number> {
    if (!this.initialized) {
      throw new Error('Database not initialized. Please wait for initialization to complete.');
    }

    // Add to offline storage first
    const offlineId = await this.offlineDb.add(tableName, {
      ...data,
      sync_status: navigator.onLine ? 'pending' : 'offline',
      local_changes: true
    });

    // Try to sync with server if online
    if (navigator.onLine) {
      try {
        const response = await this.apiClient.post(`/${tableName}`, data);

        // Update offline record with server ID if successful
        let serverData = response;
        if (response && response.success && response.data) {
          serverData = response.data;
        }

        await this.offlineDb.update(tableName, offlineId, {
          ...serverData,
          sync_status: 'synced',
          local_changes: false
        });

        return serverData.id || offlineId;
      } catch (error) {
        console.warn('Failed to sync with server, data saved offline:', error);
      }
    }

    return offlineId;
  }

  async update(tableName: string, id: number, data: any): Promise<void> {
    if (!this.initialized) {
      throw new Error('Database not initialized. Please wait for initialization to complete.');
    }

    // Update offline storage first
    await this.offlineDb.update(tableName, id, {
      ...data,
      sync_status: navigator.onLine ? 'pending' : 'offline',
      local_changes: true,
      updated_at: new Date().toISOString()
    });

    // Try to sync with server if online
    if (navigator.onLine) {
      try {
        await this.apiClient.put(`/${tableName}/${id}`, data);

        // Mark as synced
        await this.offlineDb.update(tableName, id, {
          sync_status: 'synced',
          local_changes: false
        });
      } catch (error) {
        console.warn('Failed to sync update with server:', error);
      }
    }
  }

  async delete(tableName: string, id: number): Promise<void> {
    if (!this.initialized) {
      throw new Error('Database not initialized. Please wait for initialization to complete.');
    }

    // Try server delete first if online
    if (navigator.onLine) {
      try {
        await this.apiClient.delete(`/${tableName}/${id}`);
      } catch (error) {
        console.warn('Failed to delete from server:', error);
      }
    }

    // Delete from offline storage
    await this.offlineDb.delete(tableName, id);
  }

  async authenticate(email: string, password: string): Promise<any> {
    if (!navigator.onLine) {
      throw new Error('Authentication requires internet connection');
    }

    try {
      const response = await this.apiClient.post('/auth/login', { email, password });

      // Handle different response structures
      let authData;
      if (response && response.success && response.data) {
        authData = response.data;
      } else {
        authData = response;
      }

      if (authData.token) {
        this.apiClient.setToken(authData.token);
        localStorage.setItem('auth_token', authData.token);
      }

      return authData.user || authData;
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error('Authentication failed');
    }
  }

  logout(): void {
    this.apiClient.clearToken();
    localStorage.removeItem('auth_token');
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export the singleton instance
export const db = HospitalDatabase.getInstance();