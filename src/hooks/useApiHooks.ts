import { useState, useCallback, useEffect } from 'react';
import { httpService, ApiResponse } from '@/services/HttpService';
import { toast } from 'sonner';

// Re-export patient hooks
export { usePatientApi, usePatient, usePatientSearch } from './usePatientApi';

/**
 * Base hook for API operations
 * Provides loading states, error handling, and data management
 */
export function useApiRequest<T = any>(endpoint: string) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch data from API
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await httpService.get<T[]>(endpoint);

            if (response.success && response.data) {
                setData(Array.isArray(response.data) ? response.data : []);
            } else {
                throw new Error(response.error || 'Failed to fetch data');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
            setError(errorMessage);
            console.error(`Error fetching ${endpoint}:`, err);
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    // Initial data fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Create new record
    const createRecord = useCallback(async (record: Omit<T, 'id'>) => {
        try {
            setLoading(true);
            const response = await httpService.post<T>(endpoint, record);

            if (response.success && response.data) {
                setData(prev => [...prev, response.data as T]);
                toast.success('Record created successfully');
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to create record');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create record';
            toast.error(`Error: ${errorMessage}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    // Update existing record
    const updateRecord = useCallback(async (id: string | number, updates: Partial<T>) => {
        try {
            setLoading(true);
            const response = await httpService.put<T>(`${endpoint}/${id}`, updates);

            if (response.success) {
                setData(prev => prev.map(item =>
                    (item as any).id === id ? { ...item, ...updates } : item
                ));
                toast.success('Record updated successfully');
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to update record');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update record';
            toast.error(`Error: ${errorMessage}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    // Delete record
    const deleteRecord = useCallback(async (id: string | number) => {
        try {
            setLoading(true);
            const response = await httpService.delete(`${endpoint}/${id}`);

            if (response.success) {
                setData(prev => prev.filter(item => (item as any).id !== id));
                toast.success('Record deleted successfully');
            } else {
                throw new Error(response.error || 'Failed to delete record');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete record';
            toast.error(`Error: ${errorMessage}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    // Refresh data
    const refresh = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        createRecord,
        updateRecord,
        deleteRecord,
        refresh
    };
}

/**
 * Hook for appointment management operations
 */
export function useAppointmentApi() {
    const {
        data: appointments,
        loading,
        error,
        createRecord,
        updateRecord,
        deleteRecord,
        refresh
    } = useApiRequest('/appointments');

    const createAppointment = useCallback(async (appointmentData: any) => {
        const appointment = {
            ...appointmentData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: appointmentData.status || 'scheduled'
        };
        return createRecord(appointment);
    }, [createRecord]);

    const updateAppointment = useCallback(async (id: string, updates: any) => {
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
        createAppointment,
        updateAppointment,
        deleteAppointment: deleteRecord,
        refreshAppointments: refresh
    };
}

/**
 * Hook for doctor management operations
 */
export function useDoctorApi() {
    const {
        data: doctors,
        loading,
        error,
        createRecord,
        updateRecord,
        deleteRecord,
        refresh
    } = useApiRequest('/doctors');

    const createDoctor = useCallback(async (doctorData: any) => {
        const doctor = {
            ...doctorData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: doctorData.status || 'active'
        };
        return createRecord(doctor);
    }, [createRecord]);

    return {
        doctors,
        loading,
        error,
        createDoctor,
        updateDoctor: updateRecord,
        deleteDoctor: deleteRecord,
        refreshDoctors: refresh
    };
}

/**
 * Hook for medical records management
 */
export function useMedicalRecordApi() {
    const {
        data: medicalRecords,
        loading,
        error,
        createRecord,
        updateRecord,
        deleteRecord,
        refresh
    } = useApiRequest('/medical-records');

    const createMedicalRecord = useCallback(async (recordData: any) => {
        const record = {
            ...recordData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        return createRecord(record);
    }, [createRecord]);

    return {
        medicalRecords,
        loading,
        error,
        createMedicalRecord,
        updateMedicalRecord: updateRecord,
        deleteMedicalRecord: deleteRecord,
        refreshMedicalRecords: refresh
    };
}

/**
 * Hook for billing management operations
 */
export function useBillingApi() {
    const {
        data: bills,
        loading,
        error,
        createRecord,
        updateRecord,
        deleteRecord,
        refresh
    } = useApiRequest('/billing');

    const createBill = useCallback(async (billData: any) => {
        const bill = {
            ...billData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: billData.status || 'pending'
        };
        return createRecord(bill);
    }, [createRecord]);

    return {
        bills,
        loading,
        error,
        createBill,
        updateBill: updateRecord,
        deleteBill: deleteRecord,
        refreshBills: refresh
    };
}

/**
 * Hook for inventory management operations
 */
export function useInventoryApi() {
    const {
        data: inventory,
        loading,
        error,
        createRecord,
        updateRecord,
        deleteRecord,
        refresh
    } = useApiRequest('/inventory');

    const createInventoryItem = useCallback(async (itemData: any) => {
        const item = {
            ...itemData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        return createRecord(item);
    }, [createRecord]);

    return {
        inventory,
        loading,
        error,
        createInventoryItem,
        updateInventoryItem: updateRecord,
        deleteInventoryItem: deleteRecord,
        refreshInventory: refresh
    };
}

/**
 * Hook for lab test management
 */
export function useLabTestApi() {
    const {
        data: labTests,
        loading,
        error,
        createRecord,
        updateRecord,
        deleteRecord,
        refresh
    } = useApiRequest('/lab-tests');

    const createLabTest = useCallback(async (testData: any) => {
        const test = {
            ...testData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: testData.status || 'ordered'
        };
        return createRecord(test);
    }, [createRecord]);

    return {
        labTests,
        loading,
        error,
        createLabTest,
        updateLabTest: updateRecord,
        deleteLabTest: deleteRecord,
        refreshLabTests: refresh
    };
}

/**
 * Hook for bed management operations
 */
export function useBedApi() {
    const {
        data: beds,
        loading,
        error,
        createRecord,
        updateRecord,
        deleteRecord,
        refresh
    } = useApiRequest('/beds');

    const createBed = useCallback(async (bedData: any) => {
        const bed = {
            ...bedData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: bedData.status || 'available'
        };
        return createRecord(bed);
    }, [createRecord]);

    return {
        beds,
        loading,
        error,
        createBed,
        updateBed: updateRecord,
        deleteBed: deleteRecord,
        refreshBeds: refresh
    };
}

/**
 * Hook for user management operations
 */
export function useUserApi() {
    const {
        data: users,
        loading,
        error,
        createRecord,
        updateRecord,
        deleteRecord,
        refresh
    } = useApiRequest('/users');

    const createUser = useCallback(async (userData: any) => {
        const user = {
            ...userData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: userData.status || 'active'
        };
        return createRecord(user);
    }, [createRecord]);

    return {
        users,
        loading,
        error,
        createUser,
        updateUser: updateRecord,
        deleteUser: deleteRecord,
        refreshUsers: refresh
    };
}

/**
 * Hook for notification management
 */
export function useNotificationApi() {
    const {
        data: notifications,
        loading,
        error,
        createRecord,
        updateRecord,
        deleteRecord,
        refresh
    } = useApiRequest('/notifications');

    const createNotification = useCallback(async (notificationData: any) => {
        const notification = {
            ...notificationData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: 'unread'
        };
        return createRecord(notification);
    }, [createRecord]);

    return {
        notifications,
        loading,
        error,
        createNotification,
        updateNotification: updateRecord,
        deleteNotification: deleteRecord,
        refreshNotifications: refresh
    };
}
