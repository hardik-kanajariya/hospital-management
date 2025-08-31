import { useCallback } from "react";
import { useApiRequest } from "./useApiHooks";

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