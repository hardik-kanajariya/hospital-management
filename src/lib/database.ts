// Database service for offline-first architecture with MySQL backend
import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define the IndexedDB schema
interface HospitalDB extends DBSchema {
  patients: {
    key: string;
    value: Patient;
    indexes: { 'by-phone': string; 'by-email': string; 'by-id': string };
  };
  appointments: {
    key: string;
    value: Appointment;
    indexes: { 'by-patient': string; 'by-doctor': string; 'by-date': string };
  };
  medical_records: {
    key: string;
    value: MedicalRecord;
    indexes: { 'by-patient': string; 'by-date': string };
  };
  billing: {
    key: string;
    value: BillingRecord;
    indexes: { 'by-patient': string; 'by-status': string };
  };
  inventory: {
    key: string;
    value: InventoryItem;
    indexes: { 'by-category': string; 'by-stock': number };
  };
  lab_tests: {
    key: string;
    value: LabTest;
    indexes: { 'by-patient': string; 'by-status': string };
  };
  beds: {
    key: string;
    value: BedRecord;
    indexes: { 'by-room': string; 'by-status': string };
  };
  doctors: {
    key: string;
    value: Doctor;
    indexes: { 'by-specialization': string; 'by-department': string };
  };
  sync_queue: {
    key: string;
    value: SyncOperation;
    indexes: { 'by-table': string; 'by-timestamp': number };
  };
  metadata: {
    key: string;
    value: MetadataRecord;
  };
}

// Core interfaces
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

interface InsuranceInfo {
  provider: string;
  policy_number: string;
  coverage_amount: number;
  expiry_date: string;
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

interface ContactInfo {
  phone: string;
  email: string;
  address: string;
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

class DatabaseService {
  private db: IDBPDatabase<HospitalDB> | null = null;
  private baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  private syncInterval: NodeJS.Timeout | null = null;

  async initialize(): Promise<IDBPDatabase<HospitalDB>> {
    this.db = await openDB<HospitalDB>('HospitalDB', 1, {
      upgrade(db) {
        // Patients store
        const patientsStore = db.createObjectStore('patients', { keyPath: 'id' });
        patientsStore.createIndex('by-id', 'patient_id');
        patientsStore.createIndex('by-phone', 'phone');
        patientsStore.createIndex('by-email', 'email');

        // Appointments store
        const appointmentsStore = db.createObjectStore('appointments', { keyPath: 'id' });
        appointmentsStore.createIndex('by-patient', 'patient_id');
        appointmentsStore.createIndex('by-doctor', 'doctor_id');
        appointmentsStore.createIndex('by-date', 'appointment_date');

        // Medical records store
        const recordsStore = db.createObjectStore('medical_records', { keyPath: 'id' });
        recordsStore.createIndex('by-patient', 'patient_id');
        recordsStore.createIndex('by-date', 'visit_date');

        // Billing store
        const billingStore = db.createObjectStore('billing', { keyPath: 'id' });
        billingStore.createIndex('by-patient', 'patient_id');
        billingStore.createIndex('by-status', 'payment_status');

        // Inventory store
        const inventoryStore = db.createObjectStore('inventory', { keyPath: 'id' });
        inventoryStore.createIndex('by-category', 'category');
        inventoryStore.createIndex('by-stock', 'current_stock');

        // Lab tests store
        const labStore = db.createObjectStore('lab_tests', { keyPath: 'id' });
        labStore.createIndex('by-patient', 'patient_id');
        labStore.createIndex('by-status', 'status');

        // Beds store
        const bedsStore = db.createObjectStore('beds', { keyPath: 'id' });
        bedsStore.createIndex('by-room', 'room_number');
        bedsStore.createIndex('by-status', 'status');

        // Doctors store
        const doctorsStore = db.createObjectStore('doctors', { keyPath: 'id' });
        doctorsStore.createIndex('by-specialization', 'specialization');
        doctorsStore.createIndex('by-department', 'department');

        // Sync queue store
        const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
        syncStore.createIndex('by-table', 'table_name');
        syncStore.createIndex('by-timestamp', 'timestamp');

        // Metadata store
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    });

    // Start background sync
    this.startBackgroundSync();

    return this.db;
  }

  // Generic CRUD operations for offline-first approach
  async create<T extends keyof HospitalDB>(
    storeName: T,
    data: HospitalDB[T]['value']
  ): Promise<HospitalDB[T]['value']> {
    if (!this.db) throw new Error('Database not initialized');

    const record = {
      ...data,
      id: data.id || this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      synced: false,
      local_changes: true
    };

    await this.db.put(storeName, record);
    
    // Add to sync queue
    await this.addToSyncQueue(storeName as string, record.id, 'create', record);
    
    return record;
  }

  async update<T extends keyof HospitalDB>(
    storeName: T,
    id: string,
    data: Partial<HospitalDB[T]['value']>
  ): Promise<HospitalDB[T]['value']> {
    if (!this.db) throw new Error('Database not initialized');

    const existing = await this.db.get(storeName, id);
    if (!existing) throw new Error('Record not found');

    const updated = {
      ...existing,
      ...data,
      updated_at: new Date().toISOString(),
      synced: false,
      local_changes: true
    };

    await this.db.put(storeName, updated);

    // Add to sync queue
    await this.addToSyncQueue(storeName as string, id, 'update', updated);
    
    return updated;
  }

  async delete<T extends keyof HospitalDB>(
    storeName: T,
    id: string
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.delete(storeName, id);
    
    // Add to sync queue
    await this.addToSyncQueue(storeName as string, id, 'delete', { id });
  }

  async get<T extends keyof HospitalDB>(
    storeName: T,
    id: string
  ): Promise<HospitalDB[T]['value'] | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.get(storeName, id);
  }

  async getAll<T extends keyof HospitalDB>(
    storeName: T
  ): Promise<HospitalDB[T]['value'][]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.getAll(storeName);
  }

  async query<T extends keyof HospitalDB>(
    storeName: T,
    indexName: string,
    query?: IDBValidKey | IDBKeyRange
  ): Promise<HospitalDB[T]['value'][]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.getAllFromIndex(storeName, indexName, query);
  }

  // Sync queue management
  private async addToSyncQueue(
    tableName: string,
    recordId: string,
    operation: 'create' | 'update' | 'delete',
    data: any
  ): Promise<void> {
    if (!this.db) return;

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

    await this.db.put('sync_queue', syncOperation);
  }

  // Background sync process
  private startBackgroundSync(): void {
    this.syncInterval = setInterval(async () => {
      if (this.isOnline()) {
        await this.processSyncQueue();
      }
    }, 30000); // Sync every 30 seconds when online
  }

  private async processSyncQueue(): Promise<void> {
    if (!this.db) return;

    const pendingOperations = await this.query('sync_queue', 'by-timestamp');

    for (const operation of pendingOperations.filter(op => op.status === 'pending')) {
      try {
        await this.syncOperation(operation);
        
        // Mark as completed
        await this.update('sync_queue', operation.id, { 
          status: 'completed' 
        });
      } catch (error) {
        console.error('Sync operation failed:', error);
        
        // Update retry count and status
        await this.update('sync_queue', operation.id, {
          retry_count: operation.retry_count + 1,
          status: operation.retry_count >= 3 ? 'failed' : 'pending',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async syncOperation(operation: SyncOperation): Promise<void> {
    const { table_name, operation: op, data } = operation;

    const response = await fetch(`${this.baseUrl}/${table_name}`, {
      method: this.getHttpMethod(op),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: op !== 'delete' ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Update local record sync status
    if (op !== 'delete') {
      const record = await this.get(table_name as keyof HospitalDB, data.id);
      if (record) {
        await this.db?.put(table_name as keyof HospitalDB, {
          ...record,
          synced: true,
          local_changes: false
        });
      }
    }
  }

  // API methods
  async syncFromServer(): Promise<void> {
    if (!navigator.onLine) return;

    const tables = [
      'patients', 'appointments', 'medical_records', 
      'billing', 'inventory', 'lab_tests', 'beds', 'doctors'
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

  private async mergeServerData(tableName: string, serverData: any[]): Promise<void> {
    if (!this.db) return;

    for (const serverRecord of serverData) {
      const localRecord = await this.get(tableName as keyof HospitalDB, serverRecord.id);
      
      if (!localRecord) {
        // New record from server
        await this.db.put(tableName as keyof HospitalDB, {
          ...serverRecord,
          synced: true,
          local_changes: false
        });
      } else if (!localRecord.local_changes) {
        // Update if server record is newer and no local changes
        if (new Date(serverRecord.updated_at) > new Date(localRecord.updated_at)) {
          await this.db.put(tableName as keyof HospitalDB, {
            ...serverRecord,
            synced: true,
            local_changes: false
          });
        }
      }
      // If local_changes is true, keep local version and sync will handle conflict
    }
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getHttpMethod(operation: string): string {
    switch (operation) {
      case 'create': return 'POST';
      case 'update': return 'PUT';
      case 'delete': return 'DELETE';
      default: return 'GET';
    }
  }

  private getAuthToken(): string {
    return localStorage.getItem('auth_token') || '';
  }

  // Connection status
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Cleanup
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    if (this.db) {
      this.db.close();
    }
  }
}

export const db = new DatabaseService();