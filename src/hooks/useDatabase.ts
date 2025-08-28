import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/database';

/**
 * Custom hook for database operations with automatic sync
 * Replaces useKV with proper database operations
 */
export function useDatabase<T>(tableName: string, initialData: T[] = []) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from database
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await db.getAll(tableName);
      setData(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error(`Failed to load ${tableName}:`, err);
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  // Add new record
  const addRecord = useCallback(async (record: Omit<T, 'id'>) => {
    try {
      setError(null);
      const id = await db.add(tableName, record);
      const newRecord = { ...record, id } as T;
      setData(prev => [...prev, newRecord]);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add record');
      throw err;
    }
  }, [tableName]);

  // Update existing record
  const updateRecord = useCallback(async (id: number, updates: Partial<T>) => {
    try {
      setError(null);
      await db.update(tableName, id, updates);
      setData(prev => 
        prev.map(item => 
          (item as any).id === id ? { ...item, ...updates } : item
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update record');
      throw err;
    }
  }, [tableName]);

  // Delete record
  const deleteRecord = useCallback(async (id: number) => {
    try {
      setError(null);
      await db.delete(tableName, id);
      setData(prev => prev.filter(item => (item as any).id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete record');
      throw err;
    }
  }, [tableName]);

  // Refresh data from database
  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    addRecord,
    updateRecord,
    deleteRecord,
    refresh
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
    addRecord,
    updateRecord,
    deleteRecord,
    refresh
  } = useDatabase('patients');

  const addPatient = useCallback(async (patientData: any) => {
    const patient = {
      ...patientData,
      patient_id: `P${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return addRecord(patient);
  }, [addRecord]);

  const updatePatient = useCallback(async (id: number, updates: any) => {
    const patientUpdates = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    return updateRecord(id, patientUpdates);
  }, [updateRecord]);

  return {
    patients,
    loading,
    error,
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
    addRecord,
    updateRecord,
    deleteRecord,
    refresh
  } = useDatabase('appointments');

  const addAppointment = useCallback(async (appointmentData: any) => {
    const appointment = {
      ...appointmentData,
      appointment_id: `A${Date.now()}`,
      status: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return addRecord(appointment);
  }, [addRecord]);

  const updateAppointment = useCallback(async (id: number, updates: any) => {
    const appointmentUpdates = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    return updateRecord(id, appointmentUpdates);
  }, [updateRecord]);

  return {
    appointments,
    loading,
    error,
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
    addRecord,
    updateRecord,
    deleteRecord,
    refresh
  } = useDatabase('doctors');

  const addDoctor = useCallback(async (doctorData: any) => {
    const doctor = {
      ...doctorData,
      doctor_id: `D${Date.now()}`,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return addRecord(doctor);
  }, [addRecord]);

  return {
    doctors,
    loading,
    error,
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
    data: records,
    loading,
    error,
    addRecord,
    updateRecord,
    deleteRecord,
    refresh
  } = useDatabase('medical_records');

  const addMedicalRecord = useCallback(async (recordData: any) => {
    const record = {
      ...recordData,
      record_id: `MR${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return addRecord(record);
  }, [addRecord]);

  return {
    records,
    loading,
    error,
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
    addRecord,
    updateRecord,
    deleteRecord,
    refresh
  } = useDatabase('billing');

  const addBill = useCallback(async (billData: any) => {
    const bill = {
      ...billData,
      invoice_number: `INV${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return addRecord(bill);
  }, [addRecord]);

  return {
    bills,
    loading,
    error,
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
    addRecord,
    updateRecord,
    deleteRecord,
    refresh
  } = useDatabase('inventory');

  const addInventoryItem = useCallback(async (itemData: any) => {
    const item = {
      ...itemData,
      item_code: `ITM${Date.now()}`,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return addRecord(item);
  }, [addRecord]);

  return {
    inventory,
    loading,
    error,
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
    addRecord,
    updateRecord,
    deleteRecord,
    refresh
  } = useDatabase('lab_tests');

  const addLabTest = useCallback(async (testData: any) => {
    const test = {
      ...testData,
      test_id: `LAB${Date.now()}`,
      status: 'ordered',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return addRecord(test);
  }, [addRecord]);

  return {
    labTests,
    loading,
    error,
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
    addRecord,
    updateRecord,
    deleteRecord,
    refresh
  } = useDatabase('beds');

  const addBed = useCallback(async (bedData: any) => {
    const bed = {
      ...bedData,
      bed_number: bedData.bed_number || `B${Date.now()}`,
      status: 'available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return addRecord(bed);
  }, [addRecord]);

  return {
    beds,
    loading,
    error,
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
    addRecord,
    updateRecord,
    deleteRecord,
    refresh
  } = useDatabase('users');

  const addUser = useCallback(async (userData: any) => {
    const user = {
      ...userData,
      user_id: `U${Date.now()}`,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return addRecord(user);
  }, [addRecord]);

  return {
    users,
    loading,
    error,
    addUser,
    updateUser: updateRecord,
    deleteUser: deleteRecord,
    refreshUsers: refresh
  };
}

/**
 * Hook for notifications management
 */
export function useNotifications() {
  const {
    data: notifications,
    loading,
    error,
    addRecord,
    updateRecord,
    deleteRecord,
    refresh
  } = useDatabase('notifications');

  const addNotification = useCallback(async (notificationData: any) => {
    const notification = {
      ...notificationData,
      status: 'unread',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return addRecord(notification);
  }, [addRecord]);

  const markAsRead = useCallback(async (id: number) => {
    return updateRecord(id, { 
      status: 'read',
      read_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }, [updateRecord]);

  return {
    notifications,
    loading,
    error,
    addNotification,
    updateNotification: updateRecord,
    deleteNotification: deleteRecord,
    markAsRead,
    refreshNotifications: refresh
  };
}