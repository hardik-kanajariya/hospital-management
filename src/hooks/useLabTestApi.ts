import { useCallback } from "react";
import { useApiRequest } from "./useApiHooks";

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