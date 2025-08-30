import { useCallback } from "react";
import { useApiRequest } from "./useApiHooks";

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