import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { connectionManager } from '@/lib/connection';
import { useAuth } from './useAuth';

interface SyncState {
    isOnline: boolean;
    isSyncing: boolean;
    lastSyncTime: Date | null;
    pendingSync: number;
    hasUnsyncedChanges: boolean;
    syncError: string | null;
}

interface SyncManagerHook {
    syncState: SyncState;
    forceSync: () => Promise<void>;
    clearSyncError: () => void;
}

export function useSyncManager(): SyncManagerHook {
    const { user } = useAuth();
    const [syncState, setSyncState] = useState<SyncState>({
        isOnline: navigator.onLine,
        isSyncing: false,
        lastSyncTime: null,
        pendingSync: 0,
        hasUnsyncedChanges: false,
        syncError: null
    });

    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastNotificationRef = useRef<string>('');
    const syncInProgressRef = useRef(false);

    // Debounced sync function (disabled in online-only mode)
    const debouncedSync = useCallback(() => {
        // OFFLINE FUNCTIONALITY DISABLED - No automatic sync needed in online-only mode
        console.log('Automatic sync disabled - running in online-only mode');
        return;

        // Original sync code commented out:
        /*
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }

        syncTimeoutRef.current = setTimeout(async () => {
            if (syncInProgressRef.current || !navigator.onLine) return;

            try {
                syncInProgressRef.current = true;
                setSyncState(prev => ({ ...prev, isSyncing: true, syncError: null }));

                await connectionManager.forcSync();

                setSyncState(prev => ({
                    ...prev,
                    isSyncing: false,
                    lastSyncTime: new Date(),
                    hasUnsyncedChanges: false
                }));

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Sync failed';
                setSyncState(prev => ({
                    ...prev,
                    isSyncing: false,
                    syncError: errorMessage
                }));

                // Only show sync error to admins and receptionists
                if (user?.role === 'super_admin' || user?.role === 'receptionist') {
                    toast.error(`Sync failed: ${errorMessage}`);
                }
            } finally {
                syncInProgressRef.current = false;
            }
        }, 2000); // 2 second debounce
        */
    }, [user?.role]);

    // Handle online/offline events
    useEffect(() => {
        const handleOnline = () => {
            setSyncState(prev => ({ ...prev, isOnline: true }));

            // Show "back online" notification
            if (!syncState.isOnline && (user?.role === 'super_admin' || user?.role === 'receptionist')) {
                toast.success('Connection restored - you can now continue working');
            }

            // No sync needed in online-only mode
        };

        const handleOffline = () => {
            setSyncState(prev => ({ ...prev, isOnline: false, isSyncing: false }));

            // Cancel any pending sync
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
            syncInProgressRef.current = false;

            // Show offline notification to all users since app won't work offline
            toast.error('Internet connection lost - application requires internet connection to function');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
        };
    }, [debouncedSync, syncState.isOnline, user?.role]);

    // Monitor pending sync operations (always 0 in online-only mode)
    useEffect(() => {
        const checkPendingSync = async () => {
            try {
                const stats = await connectionManager.getStats();
                setSyncState(prev => ({
                    ...prev,
                    pendingSync: 0, // Always 0 in online-only mode
                    hasUnsyncedChanges: false // Always false in online-only mode
                }));
            } catch (error) {
                console.warn('Failed to check connection stats:', error);
            }
        };

        // Check immediately and then every 30 seconds
        checkPendingSync();
        const interval = setInterval(checkPendingSync, 30000);

        return () => clearInterval(interval);
    }, []);

    // Force sync function for manual sync (disabled in online-only mode)
    const forceSync = useCallback(async () => {
        if (!navigator.onLine) {
            toast.error('Cannot sync while offline - internet connection is required');
            return;
        }

        if (syncInProgressRef.current) {
            toast.info('Application is running in online-only mode - no sync required');
            return;
        }

        try {
            syncInProgressRef.current = true;
            setSyncState(prev => ({ ...prev, isSyncing: true, syncError: null }));

            // Show message about online-only mode
            if (user?.role === 'super_admin' || user?.role === 'receptionist') {
                toast.info('Application is running in online-only mode - all data is automatically current');
            }

            await connectionManager.forcSync();

            setSyncState(prev => ({
                ...prev,
                isSyncing: false,
                lastSyncTime: new Date(),
                hasUnsyncedChanges: false
            }));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Operation failed';
            setSyncState(prev => ({
                ...prev,
                isSyncing: false,
                syncError: errorMessage
            }));

            // Show error notification only to relevant roles
            if (user?.role === 'super_admin' || user?.role === 'receptionist') {
                toast.error(`Error: ${errorMessage}`);
            }
        } finally {
            syncInProgressRef.current = false;
        }
    }, [user?.role]);

    const clearSyncError = useCallback(() => {
        setSyncState(prev => ({ ...prev, syncError: null }));
    }, []);

    return {
        syncState,
        forceSync,
        clearSyncError
    };
}
