import { useCallback } from "react";
import { useApiRequest } from "./useApiHooks";

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