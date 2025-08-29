import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { db } from '@/lib/database';
import { toast } from 'sonner';

/**
 * Generic hook for database operations with offline support
 * Uses the main database instance for consistent offline/online operations
 */
export function useDatabase(tableName: string) {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Automatically refresh data when coming back online
      fetchData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch data using the main database instance
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await db.getAll(tableName);
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error(`Error fetching ${tableName}:`, err);
      
      // Show error toast only for specific critical errors
      if (errorMessage.includes('Database not initialized')) {
        toast.error('Database not ready. Please wait...');
      }
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Add new record
  const addRecord = useCallback(async (record: any) => {
    try {
      const id = await db.add(tableName, record);
      
      // Update local state immediately for better UX
      const newRecord = { ...record, id };
      setData(prev => [...prev, newRecord]);
      
      toast.success(isOnline ? 'Record added successfully' : 'Record saved offline');
      return newRecord;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add record';
      toast.error(errorMessage);
      throw err;
    }
  }, [tableName, isOnline]);

  // Update existing record
  const updateRecord = useCallback(async (id: number, updates: any) => {
    try {
      await db.update(tableName, id, updates);
      
      // Update local state immediately
      setData(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
      
      toast.success(isOnline ? 'Record updated successfully' : 'Update saved offline');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update record';
      toast.error(errorMessage);
      throw err;
    }
  }, [tableName, isOnline]);

  // Delete record
  const deleteRecord = useCallback(async (id: number) => {
    try {
      await db.delete(tableName, id);
      
      // Update local state immediately
      setData(prev => prev.filter(item => item.id !== id));
      
      toast.success(isOnline ? 'Record deleted successfully' : 'Deletion saved offline');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete record';
      toast.error(errorMessage);
      throw err;
    }
  }, [tableName, isOnline]);

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
    isOnline,
    addRecord,
    updateRecord,
    deleteRecord,
    refresh
  } = useDatabase('patients');

  const addPatient = useCallback(async (patientData: any) => {
    const patient = {
      ...patientData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return addRecord(patient);
  }, [addRecord]);

  const updatePatient = useCallback(async (id: string, updates: any) => {
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    return updateRecord(parseInt(id), updatedData);
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: appointmentData.status || 'scheduled'
    };
    return addRecord(appointment);
  }, [addRecord]);

  const updateAppointment = useCallback(async (id: number, updates: any) => {
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    return updateRecord(id, updatedData);
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: doctorData.status || 'active'
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
    data: billing,
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: billData.status || 'pending'
    };
    return addRecord(bill);
  }, [addRecord]);

  return {
    billing,
    loading,
    error,
    isOnline,
    addBill,
    updateBill: updateRecord,
    deleteBill: deleteRecord,
    refreshBilling: refresh
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: testData.status || 'ordered'
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: bedData.status || 'available'
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: userData.status || 'active'
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'unread'
    };
    return addRecord(notification);
  }, [addRecord]);

  return {
    notifications,
    loading,
    error,
    isOnline,
    addNotificationRecord,
    updateNotification: updateRecord,
    deleteNotification: deleteRecord,
    refreshNotifications: refresh
  };
}
