import { useCallback } from "react";
import { useApiRequest } from "./useApiHooks";

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