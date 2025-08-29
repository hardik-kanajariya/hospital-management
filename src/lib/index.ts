/**
 * Enhanced Hospital Management System - Core Exports
 * Centralized exports for all core functionality
 */

// Core state management
export {
    useAppStore,
    useAuth,
    useNavigation,
    useNotifications,
    useConnection,
    useUI,
} from './store';

// API client
export {
    apiClient,
    RobustApiClient,
    db, // Backward compatibility
} from './api-client';

// Storage utilities
export {
    useLocalStorage,
    useUserPreferences,
    useCachedData,
    useFormPersistence,
    useRecentItems,
    useKV, // Backward compatibility
    storageUtils,
} from './storage';

// Notification service
export {
    notificationService,
    useNotifications as useNotificationService,
} from './notification-service';

// Connection status
export {
    useConnectionStatus,
    useConnectionSimple,
} from '../hooks/useConnectionStatus';

// Type exports
export type {
    ApiResponse,
    PaginatedResponse,
    ApiClientConfig,
    PaginationParams,
} from './api-client';

export type {
    NotificationTemplate,
    NotificationRecipient,
    NotificationData,
    NotificationHistory,
} from './notification-service';

export type {
    ConnectionStatus,
} from '../hooks/useConnectionStatus';

// Legacy compatibility - re-export API hooks
export * from '../hooks/useApiHooks';

// Backward compatibility exports
export const useDatabase = () => {
    console.warn('useDatabase is deprecated, use apiClient directly or specific API hooks');
    const { apiClient } = require('./api-client');
    return apiClient;
};

export const connectionManager = {
    getStats: async () => {
        // Return default values for compatibility
        return {
            isOnline: navigator.onLine,
            isConnected: false,
            lastCheck: new Date().toISOString(),
            serverAvailable: false,
        };
    },
    forceCheck: async () => {
        console.warn('connectionManager.forceCheck is deprecated, use useConnectionStatus hook');
        return navigator.onLine;
    },
};

// Initialize the application
export const initializeApp = async () => {
    console.log('Initializing Hospital Management System...');

    try {
        // Initialize API client
        const { apiClient } = await import('./api-client');
        await apiClient.initialize();

        // Initialize notification service
        // (already initialized as singleton)

        console.log('Hospital Management System initialized successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize Hospital Management System:', error);
        return false;
    }
};
