import { useCallback } from "react";
import { useApiRequest } from "./useApiHooks";

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