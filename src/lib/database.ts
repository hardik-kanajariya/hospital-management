/**
 * Database service for offline-first architecture with MySQL backend
 * Provides comprehensive data management for rural hospital operations
 */

// Core interfaces for hospital data models
interface Patient {
  id: string;
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address: string;
  emergency_contact: ContactInfo;
  insurance_info?: InsuranceInfo;
  medical_history: string[];
  allergies: string[];
  chronic_conditions: string[];
  vaccination_records: VaccinationRecord[];
  blood_group?: string;
  created_at: string;
  updated_at: string;
  synced: boolean;
  local_changes: boolean;
}

interface VaccinationRecord {
  vaccine_name: string;
  administered_date: string;
  next_due_date?: string;
  batch_number?: string;
  administered_by: string;
}

interface ContactInfo {
  phone: string;
  email: string;
  address: string;
}

interface InsuranceInfo {
  provider: string;
  policy_number: string;
  coverage_amount: number;
  expiry_date: string;
}

interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  duration: number; // minutes
  type: 'consultation' | 'follow-up' | 'emergency' | 'surgery';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  room_number?: string;
  created_at: string;
  updated_at: string;
  synced: boolean;
  local_changes: boolean;
}

interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  visit_date: string;
  chief_complaint: string;
  diagnosis: string[];
  symptoms: string[];
  treatment_plan: string;
  prescriptions: Prescription[];
  vital_signs?: VitalSigns;
  notes: string;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
  synced: boolean;
  local_changes: boolean;
}

interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface VitalSigns {
  temperature: number;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  heart_rate: number;
  respiratory_rate: number;
  oxygen_saturation: number;
  weight?: number;
  height?: number;
}

interface BillingRecord {
  id: string;
  patient_id: string;
  invoice_number: string;
  date: string;
  items: BillingItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_status: 'pending' | 'partial' | 'paid' | 'overdue';
  payment_method?: string;
  insurance_claim?: InsuranceClaim;
  created_at: string;
  updated_at: string;
  synced: boolean;
  local_changes: boolean;
}

interface BillingItem {
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: 'consultation' | 'medicine' | 'test' | 'procedure' | 'room';
}

interface InsuranceClaim {
  claim_number: string;
  status: 'submitted' | 'approved' | 'rejected' | 'processing';
  submitted_date: string;
  approved_amount?: number;
  rejection_reason?: string;
}

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: 'medicine' | 'equipment' | 'supplies' | 'consumables';
  current_stock: number;
  minimum_stock: number;
  unit_price: number;
  supplier: string;
  expiry_date?: string;
  batch_number?: string;
  location: string;
  created_at: string;
  updated_at: string;
  synced: boolean;
  local_changes: boolean;
}

interface LabTest {
  id: string;
  patient_id: string;
  doctor_id: string;
  test_name: string;
  test_category: string;
  ordered_date: string;
  sample_collected_date?: string;
  result_date?: string;
  status: 'ordered' | 'sample_collected' | 'in_progress' | 'completed' | 'cancelled';
  results?: LabResult[];
  notes?: string;
  urgency: 'routine' | 'urgent' | 'stat';
  created_at: string;
  updated_at: string;
  synced: boolean;
  local_changes: boolean;
}

interface LabResult {
  parameter: string;
  value: string;
  unit: string;
  reference_range: string;
  status: 'normal' | 'abnormal' | 'critical';
}

interface BedRecord {
  id: string;
  bed_number: string;
  room_number: string;
  room_type: 'general' | 'private' | 'icu' | 'emergency' | 'surgery';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  patient_id?: string;
  admission_date?: string;
  expected_discharge_date?: string;
  daily_rate: number;
  created_at: string;
  updated_at: string;
  synced: boolean;
  local_changes: boolean;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  department: string;
  qualification: string;
  experience_years: number;
  consultation_fee: number;
  availability: DoctorAvailability[];
  contact_info: ContactInfo;
  created_at: string;
  updated_at: string;
  synced: boolean;
  local_changes: boolean;
}

interface DoctorAvailability {
  day_of_week: string;
  start_time: string;
  end_time: string;
  max_patients: number;
}

interface SyncOperation {
  id: string;
  table_name: string;
  record_id: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retry_count: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  error_message?: string;
}

interface MetadataRecord {
  key: string;
  value: any;
  updated_at: string;
}

/**
 * Database Manager Class
 * Handles offline-first operations with MySQL backend synchronization
 */
class DatabaseManager {
  private db: IDBDatabase | null = null;
  private dbName = 'HospitalDB';
  private dbVersion = 2;
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  private syncInterval: number | null = null;

  constructor() {
    // Don't call initialize in constructor to avoid race conditions
  }

  /**
   * Initialize IndexedDB database
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.startBackgroundSync();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores with proper indexes
        this.createObjectStores(db);
      };
    });
  }

  /**
   * Create all required object stores and indexes
   */
  private createObjectStores(db: IDBDatabase): void {
    const stores = [
      {
        name: 'patients',
        keyPath: 'id',
        indexes: [
          { name: 'patient_id', keyPath: 'patient_id', unique: true },
          { name: 'phone', keyPath: 'phone', unique: false },
          { name: 'email', keyPath: 'email', unique: false }
        ]
      },
      {
        name: 'appointments',
        keyPath: 'id',
        indexes: [
          { name: 'patient_id', keyPath: 'patient_id', unique: false },
          { name: 'doctor_id', keyPath: 'doctor_id', unique: false },
          { name: 'appointment_date', keyPath: 'appointment_date', unique: false },
          { name: 'status', keyPath: 'status', unique: false }
        ]
      },
      {
        name: 'medical_records',
        keyPath: 'id',
        indexes: [
          { name: 'patient_id', keyPath: 'patient_id', unique: false },
          { name: 'doctor_id', keyPath: 'doctor_id', unique: false },
          { name: 'visit_date', keyPath: 'visit_date', unique: false }
        ]
      },
      {
        name: 'billing',
        keyPath: 'id',
        indexes: [
          { name: 'patient_id', keyPath: 'patient_id', unique: false },
          { name: 'invoice_number', keyPath: 'invoice_number', unique: true },
          { name: 'payment_status', keyPath: 'payment_status', unique: false }
        ]
      },
      {
        name: 'inventory',
        keyPath: 'id',
        indexes: [
          { name: 'category', keyPath: 'category', unique: false },
          { name: 'name', keyPath: 'name', unique: false },
          { name: 'current_stock', keyPath: 'current_stock', unique: false }
        ]
      },
      {
        name: 'lab_tests',
        keyPath: 'id',
        indexes: [
          { name: 'patient_id', keyPath: 'patient_id', unique: false },
          { name: 'doctor_id', keyPath: 'doctor_id', unique: false },
          { name: 'status', keyPath: 'status', unique: false },
          { name: 'ordered_date', keyPath: 'ordered_date', unique: false }
        ]
      },
      {
        name: 'beds',
        keyPath: 'id',
        indexes: [
          { name: 'bed_number', keyPath: 'bed_number', unique: true },
          { name: 'room_number', keyPath: 'room_number', unique: false },
          { name: 'status', keyPath: 'status', unique: false },
          { name: 'patient_id', keyPath: 'patient_id', unique: false }
        ]
      },
      {
        name: 'doctors',
        keyPath: 'id',
        indexes: [
          { name: 'name', keyPath: 'name', unique: false },
          { name: 'specialization', keyPath: 'specialization', unique: false },
          { name: 'department', keyPath: 'department', unique: false }
        ]
      },
      {
        name: 'sync_queue',
        keyPath: 'id',
        indexes: [
          { name: 'table_name', keyPath: 'table_name', unique: false },
          { name: 'timestamp', keyPath: 'timestamp', unique: false },
          { name: 'status', keyPath: 'status', unique: false }
        ]
      },
      {
        name: 'metadata',
        keyPath: 'key',
        indexes: []
      }
    ];

    stores.forEach(storeConfig => {
      let store: IDBObjectStore;
      
      if (db.objectStoreNames.contains(storeConfig.name)) {
        db.deleteObjectStore(storeConfig.name);
      }
      
      store = db.createObjectStore(storeConfig.name, { keyPath: storeConfig.keyPath });
      
      storeConfig.indexes.forEach(index => {
        store.createIndex(index.name, index.keyPath, { unique: index.unique });
      });
    });
  }

  /**
   * Generic create operation
   */
  async create(storeName: string, data: any): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const record = {
      ...data,
      id: data.id || this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      synced: false,
      local_changes: true
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(record);

      request.onsuccess = () => {
        this.addToSyncQueue(storeName, record.id, 'create', record);
        resolve(record);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic read operation by ID
   */
  async get(storeName: string, id: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all records from a store
   */
  async getAll(storeName: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update a record
   */
  async update(storeName: string, id: string, data: Partial<any>): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const existing = await this.get(storeName, id);
    if (!existing) throw new Error('Record not found');

    const updated = {
      ...existing,
      ...data,
      updated_at: new Date().toISOString(),
      synced: false,
      local_changes: true
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(updated);

      request.onsuccess = () => {
        this.addToSyncQueue(storeName, id, 'update', updated);
        resolve(updated);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a record
   */
  async delete(storeName: string, id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        this.addToSyncQueue(storeName, id, 'delete', { id });
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Query records by index
   */
  async query(storeName: string, indexName: string, query?: IDBValidKey | IDBKeyRange): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = query ? index.getAll(query) : index.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Search records with filters
   */
  async search(storeName: string, filters: Record<string, any>): Promise<any[]> {
    const allRecords = await this.getAll(storeName);
    
    return allRecords.filter(record => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === null || value === '') return true;
        
        const recordValue = record[key];
        if (typeof value === 'string' && typeof recordValue === 'string') {
          return recordValue.toLowerCase().includes(value.toLowerCase());
        }
        return recordValue === value;
      });
    });
  }

  /**
   * Add operation to sync queue
   */
  private async addToSyncQueue(tableName: string, recordId: string, operation: 'create' | 'update' | 'delete', data: any): Promise<void> {
    const syncOperation: SyncOperation = {
      id: this.generateId(),
      table_name: tableName,
      record_id: recordId,
      operation,
      data,
      timestamp: Date.now(),
      retry_count: 0,
      status: 'pending'
    };

    await this.create('sync_queue', syncOperation);
  }

  /**
   * Start background synchronization
   */
  private startBackgroundSync(): void {
    this.syncInterval = setInterval(async () => {
      if (navigator.onLine) {
        await this.processSyncQueue();
      }
    }, 30000); // Sync every 30 seconds when online
  }

  /**
   * Process pending sync operations
   */
  private async processSyncQueue(): Promise<void> {
    try {
      const pendingOps = await this.query('sync_queue', 'status', 'pending');
      
      for (const operation of pendingOps) {
        try {
          await this.syncOperation(operation);
          await this.update('sync_queue', operation.id, { status: 'completed' });
        } catch (error) {
          console.error('Sync operation failed:', error);
          
          const retryCount = operation.retry_count + 1;
          await this.update('sync_queue', operation.id, {
            retry_count: retryCount,
            status: retryCount >= 3 ? 'failed' : 'pending',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    } catch (error) {
      console.error('Failed to process sync queue:', error);
    }
  }

  /**
   * Sync individual operation with server
   */
  private async syncOperation(operation: SyncOperation): Promise<void> {
    const { table_name, operation: op, data, record_id } = operation;
    
    let url = `${this.baseUrl}/${table_name}`;
    let method = 'POST';
    
    switch (op) {
      case 'update':
        url += `/${record_id}`;
        method = 'PUT';
        break;
      case 'delete':
        url += `/${record_id}`;
        method = 'DELETE';
        break;
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: method !== 'DELETE' ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Update local record sync status
    if (op !== 'delete') {
      const record = await this.get(table_name, record_id);
      if (record) {
        await this.update(table_name, record_id, {
          synced: true,
          local_changes: false
        });
      }
    }
  }

  /**
   * Sync data from server
   */
  async syncFromServer(): Promise<void> {
    if (!navigator.onLine) return;

    const tables = [
      'patients', 'appointments', 'medical_records', 'billing',
      'inventory', 'lab_tests', 'beds', 'doctors'
    ];

    for (const table of tables) {
      try {
        const response = await fetch(`${this.baseUrl}/${table}`, {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        });

        if (response.ok) {
          const serverData = await response.json();
          await this.mergeServerData(table, serverData);
        }
      } catch (error) {
        console.error(`Failed to sync ${table}:`, error);
      }
    }
  }

  /**
   * Merge server data with local data
   */
  private async mergeServerData(tableName: string, serverData: any[]): Promise<void> {
    for (const serverRecord of serverData) {
      const localRecord = await this.get(tableName, serverRecord.id);
      
      if (!localRecord) {
        // New record from server
        const record = {
          ...serverRecord,
          synced: true,
          local_changes: false
        };
        
        await new Promise((resolve, reject) => {
          const transaction = this.db!.transaction([tableName], 'readwrite');
          const store = transaction.objectStore(tableName);
          const request = store.add(record);
          
          request.onsuccess = () => resolve(record);
          request.onerror = () => reject(request.error);
        });
      } else if (!localRecord.local_changes) {
        // Update if server record is newer and no local changes
        if (new Date(serverRecord.updated_at) > new Date(localRecord.updated_at)) {
          await this.update(tableName, serverRecord.id, {
            ...serverRecord,
            synced: true,
            local_changes: false
          });
        }
      }
    }
  }

  /**
   * Utility methods
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getAuthToken(): string {
    return localStorage.getItem('auth_token') || '';
  }

  /**
   * Connection status
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<{ pending: number; failed: number; total: number }> {
    const allOps = await this.getAll('sync_queue');
    const pending = allOps.filter(op => op.status === 'pending').length;
    const failed = allOps.filter(op => op.status === 'failed').length;
    
    return { pending, failed, total: allOps.length };
  }

  /**
   * Clear completed sync operations
   */
  async clearCompletedSync(): Promise<void> {
    const completedOps = await this.query('sync_queue', 'status', 'completed');
    
    for (const op of completedOps) {
      await this.delete('sync_queue', op.id);
    }
  }

  /**
   * Force sync all pending operations
   */
  async forceSyncAll(): Promise<void> {
    if (!navigator.onLine) {
      throw new Error('Cannot sync while offline');
    }
    
    await this.processSyncQueue();
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    if (this.db) {
      this.db.close();
    }
  }
}

// Export singleton instance
export const db = new DatabaseManager();

// Export types for use in components
export type {
  Patient,
  Appointment,
  MedicalRecord,
  BillingRecord,
  InventoryItem,
  LabTest,
  BedRecord,
  Doctor,
  VaccinationRecord,
  ContactInfo,
  InsuranceInfo,
  Prescription,
  VitalSigns,
  BillingItem,
  InsuranceClaim,
  LabResult,
  DoctorAvailability,
  SyncOperation,
  MetadataRecord
};