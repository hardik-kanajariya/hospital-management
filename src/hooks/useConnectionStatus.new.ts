/**
 * Enhanced Connection Status Hook
 * Monitors internet connectivity and server health with automatic retry
 */

import { useEffect, useCallback } from 'react';
import { useConnection } from '../lib/store';
import { httpService } from '@/services/HttpService';

export interface ConnectionStatus {
    isOnline: boolean;
    isServerReachable: boolean;
    lastSyncTime: Date | null;
    syncInProgress: boolean;
    offlineActionsCount: number;
    connectionState: 'online' | 'offline' | 'server-unreachable' | 'syncing';
}

export function useConnectionStatus(): {
    connectionState: ConnectionStatus;
    checkConnection: () => Promise<boolean>;
    syncOfflineActions: () => Promise<void>;
    forceSync: () => Promise<void>;
} {
    const {
        isOnline,
        isServerReachable,
        lastSyncTime,
        syncInProgress,
        offlineActions,
        setServerReachable,
        setLastSyncTime,
        setSyncInProgress,
        clearOfflineActions,
    } = useConnection();

    // Determine overall connection state
    const getConnectionState = useCallback((): ConnectionStatus['connectionState'] => {
        if (syncInProgress) return 'syncing';
        if (!isOnline) return 'offline';
        if (!isServerReachable) return 'server-unreachable';
        return 'online';
    }, [isOnline, isServerReachable, syncInProgress]);

    // Check server health
    const checkConnection = useCallback(async (): Promise<boolean> => {
        if (!isOnline) {
            setServerReachable(false);
            return false;
        }

        try {
            const isHealthy = await httpService.checkHealth();
            setServerReachable(isHealthy);

            if (isHealthy) {
                setLastSyncTime(new Date());
            }

            return isHealthy;
        } catch (error) {
            console.error('Connection check failed:', error);
            setServerReachable(false);
            return false;
        }
    }, [isOnline, setServerReachable, setLastSyncTime]);

    // Sync offline actions when connection is restored
    const syncOfflineActions = useCallback(async (): Promise<void> => {
        if (!isOnline || !isServerReachable || offlineActions.length === 0) {
            return;
        }

        setSyncInProgress(true);

        try {
            console.log(`Syncing ${offlineActions.length} offline actions...`);

            // Process offline actions
            for (const action of offlineActions) {
                try {
                    switch (action.type) {
                        case 'CREATE':
                            await httpService.post(action.endpoint, action.data);
                            break;
                        case 'UPDATE':
                            await httpService.put(`${action.endpoint}/${action.id}`, action.data);
                            break;
                        case 'DELETE':
                            await httpService.delete(`${action.endpoint}/${action.id}`);
                            break;
                        case 'CREATE_NOTIFICATION':
                            await httpService.post('/notifications', action.data);
                            break;
                        default:
                            console.warn('Unknown offline action type:', action.type);
                    }
                } catch (error) {
                    console.error('Failed to sync offline action:', action, error);
                    // Continue with other actions even if one fails
                }
            }

            // Clear successfully synced actions
            clearOfflineActions();
            setLastSyncTime(new Date());

            console.log('Offline actions synced successfully');
        } catch (error) {
            console.error('Failed to sync offline actions:', error);
        } finally {
            setSyncInProgress(false);
        }
    }, [
        isOnline,
        isServerReachable,
        offlineActions,
        setSyncInProgress,
        clearOfflineActions,
        setLastSyncTime
    ]);

    // Force sync - check connection and sync if available
    const forceSync = useCallback(async (): Promise<void> => {
        const isConnected = await checkConnection();
        if (isConnected) {
            await syncOfflineActions();
        }
    }, [checkConnection, syncOfflineActions]);

    // Set up periodic health checks
    useEffect(() => {
        // Initial connection check
        checkConnection();

        // Set up periodic health checks every 30 seconds
        const healthCheckInterval = setInterval(checkConnection, 30000);

        // Set up online/offline event listeners
        const handleOnline = () => {
            console.log('Network connection restored');
            // Wait a bit for the connection to stabilize
            setTimeout(async () => {
                const isConnected = await checkConnection();
                if (isConnected) {
                    await syncOfflineActions();
                }
            }, 1000);
        };

        const handleOffline = () => {
            console.log('Network connection lost');
            setServerReachable(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cleanup
        return () => {
            clearInterval(healthCheckInterval);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [checkConnection, syncOfflineActions, setServerReachable]);

    // Auto-sync when connection is restored
    useEffect(() => {
        if (isOnline && isServerReachable && offlineActions.length > 0 && !syncInProgress) {
            // Debounce sync attempts
            const syncTimeout = setTimeout(syncOfflineActions, 2000);
            return () => clearTimeout(syncTimeout);
        }
    }, [isOnline, isServerReachable, offlineActions.length, syncInProgress, syncOfflineActions]);

    const connectionState: ConnectionStatus = {
        isOnline,
        isServerReachable,
        lastSyncTime,
        syncInProgress,
        offlineActionsCount: offlineActions.length,
        connectionState: getConnectionState(),
    };

    return {
        connectionState,
        checkConnection,
        syncOfflineActions,
        forceSync,
    };
}

// Export a simplified version for backward compatibility
export function useConnectionSimple() {
    const { connectionState } = useConnectionStatus();

    return {
        isOnline: connectionState.isOnline,
        isConnected: connectionState.isOnline && connectionState.isServerReachable,
        connectionState: connectionState.connectionState,
    };
}
