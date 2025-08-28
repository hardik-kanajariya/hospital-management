import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/config';
import { useAuth } from './useAuth';
import { useNotifications } from './useNotifications';

// IndexedDB configuration for offline support
const DB_NAME = 'MedCareRuralDB';
const DB_VERSION = 1;

/**
 * IndexedDB utility functions for offline support
 */
class OfflineDB {
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
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
            store.createIndex('created_at', 'created_at');
            store.createIndex('updated_at', 'updated_at');
          }
        });

        // Sync queue for offline changes
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('table_name', 'table_name');
          syncStore.createIndex('operation', 'operation');
          syncStore.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }

  async getAll(tableName: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readonly');
      const store = transaction.objectStore(tableName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async add(tableName: string, data: any): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readwrite');
      const store = transaction.objectStore(tableName);
      const request = store.add(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve({ ...data, id: request.result });
    });
  }

  async update(tableName: string, data: any): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readwrite');
      const store = transaction.objectStore(tableName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(data);
    });
  }

  async delete(tableName: string, id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readwrite');
      const store = transaction.objectStore(tableName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async addToSyncQueue(operation: string, tableName: string, data: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const syncItem = {
      operation,
      table_name: tableName,
      data,
      timestamp: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const request = store.add(syncItem);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getSyncQueue(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readonly');
      const store = transaction.objectStore('sync_queue');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async clearSyncQueue(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

// Global instance
const offlineDB = new OfflineDB();

/**
 * Initialize offline database
 */
export const initializeOfflineDB = async (): Promise<void> => {
  await offlineDB.initialize();
};

/**
 * Generic hook for database operations with offline support
 */
export function useDatabase(tableName: string) {
  const token = localStorage.getItem('auth_token');
  const { addNotification } = useNotifications();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch data from API or offline storage
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isOnline && token) {
        // Try to fetch from API
        const response = await axios.get(`${API_BASE_URL}/${tableName}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Store in offline DB
        for (const item of response.data) {
          try {
            await offlineDB.update(tableName, item);
          } catch (e) {
            await offlineDB.add(tableName, item);
          }
        }

        setData(response.data);
      } else {
        // Fetch from offline storage
        const offlineData = await offlineDB.getAll(tableName);
        setData(offlineData);
      }
    } catch (err: any) {
      // Fallback to offline data
      try {
        const offlineData = await offlineDB.getAll(tableName);
        setData(offlineData);
        setError('Using offline data - some information may be outdated');
      } catch (offlineErr) {
        setError(err.message || 'Error fetching data');
      }

      addNotification({
        message: `Error fetching ${tableName}: ${err.message}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [tableName, token, isOnline, addNotification]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sync offline changes when coming online
  useEffect(() => {
    if (isOnline && token) {
      syncOfflineChanges();
    }
  }, [isOnline, token]);

  // Sync offline changes to server
  const syncOfflineChanges = useCallback(async () => {
    try {
      const syncQueue = await offlineDB.getSyncQueue();

      for (const item of syncQueue) {
        try {
          switch (item.operation) {
            case 'create':
              await axios.post(`${API_BASE_URL}/${item.table_name}`, item.data, {
                headers: { Authorization: `Bearer ${token}` }
              });
              break;
            case 'update':
              await axios.put(`${API_BASE_URL}/${item.table_name}/${item.data.id}`, item.data, {
                headers: { Authorization: `Bearer ${token}` }
              });
              break;
            case 'delete':
              await axios.delete(`${API_BASE_URL}/${item.table_name}/${item.data.id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              break;
          }
        } catch (syncError) {
          console.error('Sync error for item:', item, syncError);
        }
      }

      // Clear sync queue after successful sync
      await offlineDB.clearSyncQueue();

      // Refresh data after sync
      await fetchData();

      addNotification({
        message: 'Data synchronized successfully',
        type: 'success'
      });
    } catch (err: any) {
      console.error('Sync failed:', err);
    }
  }, [token, fetchData, addNotification]);

  // Add new record
  const addRecord = useCallback(async (record: any) => {
    setLoading(true);
    setError(null);

    try {
      const newRecord = {
        ...record,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (isOnline && token) {
        // Add to server
        const response = await axios.post(`${API_BASE_URL}/${tableName}`, newRecord, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Update local storage
        await offlineDB.update(tableName, response.data);
        setData(prevData => [...prevData, response.data]);

        addNotification({
          message: `${tableName.slice(0, -1)} added successfully`,
          type: 'success'
        });

        return response.data;
      } else {
        // Add to offline storage
        const savedRecord = await offlineDB.add(tableName, newRecord);
        await offlineDB.addToSyncQueue('create', tableName, savedRecord);

        setData(prevData => [...prevData, savedRecord]);

        addNotification({
          message: `${tableName.slice(0, -1)} saved offline - will sync when online`,
          type: 'info'
        });

        return savedRecord;
      }
    } catch (err: any) {
      setError(err.message || 'Error adding record');
      addNotification({
        message: `Error adding to ${tableName}: ${err.message}`,
        type: 'error'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tableName, token, isOnline, addNotification]);

  // Update existing record
  const updateRecord = useCallback(async (id: number, updates: any) => {
    setLoading(true);
    setError(null);

    try {
      const updatedRecord = {
        ...updates,
        id,
        updated_at: new Date().toISOString()
      };

      if (isOnline && token) {
        // Update on server
        const response = await axios.put(`${API_BASE_URL}/${tableName}/${id}`, updatedRecord, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Update local storage
        await offlineDB.update(tableName, response.data);
        setData(prevData => prevData.map(item => item.id === id ? response.data : item));

        addNotification({
          message: `${tableName.slice(0, -1)} updated successfully`,
          type: 'success'
        });

        return response.data;
      } else {
        // Update offline storage
        await offlineDB.update(tableName, updatedRecord);
        await offlineDB.addToSyncQueue('update', tableName, updatedRecord);

        setData(prevData => prevData.map(item => item.id === id ? updatedRecord : item));

        addNotification({
          message: `${tableName.slice(0, -1)} updated offline - will sync when online`,
          type: 'info'
        });

        return updatedRecord;
      }
    } catch (err: any) {
      setError(err.message || 'Error updating record');
      addNotification({
        message: `Error updating ${tableName}: ${err.message}`,
        type: 'error'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tableName, token, isOnline, addNotification]);

  // Delete record
  const deleteRecord = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      if (isOnline && token) {
        // Delete from server
        await axios.delete(`${API_BASE_URL}/${tableName}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Remove from local storage
        await offlineDB.delete(tableName, id);
        setData(prevData => prevData.filter(item => item.id !== id));

        addNotification({
          message: `${tableName.slice(0, -1)} deleted successfully`,
          type: 'success'
        });
      } else {
        // Mark for deletion in offline storage
        await offlineDB.addToSyncQueue('delete', tableName, { id });
        setData(prevData => prevData.filter(item => item.id !== id));

        addNotification({
          message: `${tableName.slice(0, -1)} marked for deletion - will sync when online`,
          type: 'info'
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting record');
      addNotification({
        message: `Error deleting from ${tableName}: ${err.message}`,
        type: 'error'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tableName, token, isOnline, addNotification]);

  // Refresh data
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    isOnline,
    addRecord,
    updateRecord,
    deleteRecord,
    refresh,
    syncOfflineChanges
  };
}

/**
 * Hook for patient management operations
 */
export function usePatients() {
  const {
    data: patients,
    loading,
    error,
    isOnline,
    addRecord,
    updateRecord,
    deleteRecord,
    refresh
  } = useDatabase('patients');

  const addPatient = useCallback(async (patientData: any) => {
    const patient = {
      ...patientData,
      patient_id: `P${Date.now()}`,
      status: 'active'
    };
    return addRecord(patient);
  }, [addRecord]);

  const updatePatient = useCallback(async (id: string, updates: any) => {
    return updateRecord(id, updates);
  }, [updateRecord]);

  return {
    patients,
    loading,
    error,
    isOnline,
    addPatient,
    updatePatient,
    deletePatient: deleteRecord,
    refreshPatients: refresh
  };
}

/**
 * Hook for appointment management operations
 */
export function useAppointments() {
  const {
    data: appointments,
    loading,
    error,
    isOnline,
    addRecord,
    updateRecord,
    deleteRecord,
    refresh
  } = useDatabase('appointments');

  const addAppointment = useCallback(async (appointmentData: any) => {
    const appointment = {
      ...appointmentData,
      appointment_id: `A${Date.now()}`,
      status: 'scheduled'
    };
    return addRecord(appointment);
  }, [addRecord]);

  const updateAppointment = useCallback(async (id: number, updates: any) => {
    return updateRecord(id, updates);
  }, [updateRecord]);

  return {
    appointments,
    loading,
    error,
    isOnline,
    addAppointment,
    updateAppointment,
    deleteAppointment: deleteRecord,
    refreshAppointments: refresh
  };
}

/**
 * Hook for doctor management operations
 */
export function useDoctors() {
  const {
    data: doctors,
    loading,
    error,
    isOnline,
    addRecord,
    updateRecord,
    deleteRecord,
    refresh
  } = useDatabase('doctors');

  const addDoctor = useCallback(async (doctorData: any) => {
    const doctor = {
      ...doctorData,
      doctor_id: `D${Date.now()}`,
      status: 'active'
    };
    return addRecord(doctor);
  }, [addRecord]);

  return {
    doctors,
    loading,
    error,
    isOnline,
    addDoctor,
    updateDoctor: updateRecord,
    deleteDoctor: deleteRecord,
    refreshDoctors: refresh
  };
}

/**
 * Hook for medical records management
 */
export function useMedicalRecords() {
  const {
    data: medicalRecords,
    loading,
    error,
    isOnline,
    addRecord,
    updateRecord,
    deleteRecord,
    refresh
  } = useDatabase('medical_records');

  const addMedicalRecord = useCallback(async (recordData: any) => {
    const record = {
      ...recordData,
      record_id: `MR${Date.now()}`
    };
    return addRecord(record);
  }, [addRecord]);

  return {
    medicalRecords,
    loading,
    error,
    isOnline,
    addMedicalRecord,
    updateMedicalRecord: updateRecord,
    deleteMedicalRecord: deleteRecord,
    refreshMedicalRecords: refresh
  };
}

/**
 * Hook for billing management operations
 */
export function useBilling() {
  const {
    data: bills,
    loading,
    error,
    isOnline,
    addRecord,
    updateRecord,
    deleteRecord,
    refresh
  } = useDatabase('billing');

  const addBill = useCallback(async (billData: any) => {
    const bill = {
      ...billData,
      invoice_number: `INV${Date.now()}`,
      status: 'pending'
    };
    return addRecord(bill);
  }, [addRecord]);

  return {
    bills,
    loading,
    error,
    isOnline,
    addBill,
    updateBill: updateRecord,
    deleteBill: deleteRecord,
    refreshBills: refresh
  };
}

/**
 * Hook for inventory management operations
 */
export function useInventory() {
  const {
    data: inventory,
    loading,
    error,
    isOnline,
    addRecord,
    updateRecord,
    deleteRecord,
    refresh
  } = useDatabase('inventory');

  const addInventoryItem = useCallback(async (itemData: any) => {
    const item = {
      ...itemData,
      item_code: `ITM${Date.now()}`
    };
    return addRecord(item);
  }, [addRecord]);

  return {
    inventory,
    loading,
    error,
    isOnline,
    addInventoryItem,
    updateInventoryItem: updateRecord,
    deleteInventoryItem: deleteRecord,
    refreshInventory: refresh
  };
}

/**
 * Hook for lab tests management
 */
export function useLabTests() {
  const {
    data: labTests,
    loading,
    error,
    isOnline,
    addRecord,
    updateRecord,
    deleteRecord,
    refresh
  } = useDatabase('lab_tests');

  const addLabTest = useCallback(async (testData: any) => {
    const test = {
      ...testData,
      test_id: `LAB${Date.now()}`,
      status: 'ordered'
    };
    return addRecord(test);
  }, [addRecord]);

  return {
    labTests,
    loading,
    error,
    isOnline,
    addLabTest,
    updateLabTest: updateRecord,
    deleteLabTest: deleteRecord,
    refreshLabTests: refresh
  };
}

/**
 * Hook for bed management operations
 */
export function useBeds() {
  const {
    data: beds,
    loading,
    error,
    isOnline,
    addRecord,
    updateRecord,
    deleteRecord,
    refresh
  } = useDatabase('beds');

  const addBed = useCallback(async (bedData: any) => {
    const bed = {
      ...bedData,
      bed_number: bedData.bed_number || `B${Date.now()}`,
      status: 'available'
    };
    return addRecord(bed);
  }, [addRecord]);

  return {
    beds,
    loading,
    error,
    isOnline,
    addBed,
    updateBed: updateRecord,
    deleteBed: deleteRecord,
    refreshBeds: refresh
  };
}

/**
 * Hook for user management operations
 */
export function useUsers() {
  const {
    data: users,
    loading,
    error,
    isOnline,
    addRecord,
    updateRecord,
    deleteRecord,
    refresh
  } = useDatabase('users');

  const addUser = useCallback(async (userData: any) => {
    const user = {
      ...userData,
      user_id: `U${Date.now()}`,
      status: 'active'
    };
    return addRecord(user);
  }, [addRecord]);

  return {
    users,
    loading,
    error,
    isOnline,
    addUser,
    updateUser: updateRecord,
    deleteUser: deleteRecord,
    refreshUsers: refresh
  };
}

/**
 * Hook for notifications management
 */
export function useNotificationsData() {
  const {
    data: notifications,
    loading,
    error,
    isOnline,
    addRecord,
    updateRecord,
    deleteRecord,
    refresh
  } = useDatabase('notifications');

  const addNotificationRecord = useCallback(async (notificationData: any) => {
    const notification = {
      ...notificationData,
      status: 'unread'
    };
    return addRecord(notification);
  }, [addRecord]);

  const markAsRead = useCallback(async (id: number) => {
    return updateRecord(id, {
      status: 'read',
      read_at: new Date().toISOString()
    });
  }, [updateRecord]);

  return {
    notifications,
    loading,
    error,
    isOnline,
    addNotificationRecord,
    updateNotification: updateRecord,
    deleteNotification: deleteRecord,
    markAsRead,
    refreshNotifications: refresh
  };
}