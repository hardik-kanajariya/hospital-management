import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from './useAuth'; 
import { useNotifications } from './useNotifications';

/**
 * Generic hook for database operations
 */
function useDatabase(tableName: string) {
  const { token } = useAuth();
  const { addNotification } = useNotifications();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/${tableName}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (err: any) {
      setError(err.message || 'Error fetching data');
      addNotification({ message: `Error fetching ${tableName}: ${err.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [tableName, token, addNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addRecord = useCallback(async (record: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/${tableName}`, record, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(prevData => [...prevData, response.data]);
      addNotification({ message: `${tableName.slice(0, -1)} added successfully`, type: 'success' });
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Error adding record');
      addNotification({ message: `Error adding to ${tableName}: ${err.message}`, type: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tableName, token, addNotification]);

  const updateRecord = useCallback(async (id: number, updates: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${API_BASE_URL}/${tableName}/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(prevData => prevData.map(item => item.id === id ? response.data : item));
      addNotification({ message: `${tableName.slice(0, -1)} updated successfully`, type: 'success' });
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
    error,
    refreshDoctors: refresh
    
}

/**
 * Hook for medical records management
 */
  const {
    error,
    loading,
    error,
    addRecord,
    deleteRecord,
      ...te
  } = useDatabase('medical_records');

  const addMedicalRecord = useCallback(async (recordData: any) => {
    return addRecord
      ...recordData,
      record_id: `MR${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    deleteLabTest: deleteReco
  }, [addRecord]);

  return {
 * Hook for 
    loading,
  const {
    addMedicalRecord,
    updateMedicalRecord: updateRecord,
    deleteMedicalRecord: deleteRecord,
    refreshMedicalRecords: refresh
  };


   
 * Hook for billing management operations
   
export function useBilling() {
    retur
    data: bills,
  return {
    error,
    error,
    updateRecord,
    deleteBed: de
    refresh
  } = useDatabase('billing');

  const addBill = useCallback(async (billData: any) => {
    const bill = {
      ...billData,
      invoice_number: `INV${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString(),
    deleteRecord,
    };
    return addRecord(bill);
  }, [addRecord]);

  return {
    bills,
    loading,
    return
    addBill,
    updateBill: updateRecord,
    deleteBill: deleteRecord,
    refreshBills: refresh
  };
 

}
 * Hook for inventory management operations
 * 
export function useInventory() {
  const {
    data: inventory,
    error,
    error,
    addRecord,
    updateRecord,

    refresh
  } = useDatabase('inventory');

  const addInventoryItem = useCallback(async (itemData: any) => {
    const item = {
  }, [addRecord]);
      item_code: `ITM${Date.now()}`,
    return updateRecord
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

  }, [addRecord]);

  return {
    updateNoti
    loading,
    refres
    addInventoryItem,
    updateInventoryItem: updateRecord,
    deleteInventoryItem: deleteRecord,

  };



 * Hook for lab tests management

export function useLabTests() {
  const {
    data: labTests,

    error,

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

    loading,
    error,
    addLabTest,
    updateLabTest: updateRecord,
    deleteLabTest: deleteRecord,
    refreshLabTests: refresh
  };



 * Hook for bed management operations

export function useBeds() {

    data: beds,
    loading,
    error,

    updateRecord,
    deleteRecord,
    refresh
  } = useDatabase('beds');

  const addBed = useCallback(async (bedData: any) => {
    const bed = {

      bed_number: bedData.bed_number || `B${Date.now()}`,
      status: 'available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

  }, [addRecord]);

  return {

    loading,

    addBed,
    updateBed: updateRecord,
    deleteBed: deleteRecord,

  };



 * Hook for user management operations

export function useUsers() {
  const {
    data: users,

    error,

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

  }, [addRecord]);

  return {

    loading,
    error,
    addUser,
    updateUser: updateRecord,
    deleteUser: deleteRecord,
    refreshUsers: refresh
  };



 * Hook for notifications management

export function useNotifications() {

    data: notifications,
    loading,
    error,

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

    return addRecord(notification);


  const markAsRead = useCallback(async (id: number) => {
    return updateRecord(id, { 

      read_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }, [updateRecord]);


    notifications,

    error,

    updateNotification: updateRecord,
    deleteNotification: deleteRecord,
    markAsRead,
    refreshNotifications: refresh
  };
