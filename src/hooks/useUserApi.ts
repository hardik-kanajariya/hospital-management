import { useCallback } from "react";
import { useApiRequest } from "./useApiHooks";

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