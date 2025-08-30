import { useCallback } from "react";
import { useApiRequest } from "./useApiHooks";

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