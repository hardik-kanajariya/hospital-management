import { useCallback } from "react";
import { useApiRequest } from "./useApiHooks";

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