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

    // Debounced sync function
    const debouncedSync = useCallback(() => {
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
    }, [user?.role]);

    // Handle online/offline events
    useEffect(() => {
        const handleOnline = () => {
            setSyncState(prev => ({ ...prev, isOnline: true }));

            // Only show "back online" notification if we were previously offline
            // and only to relevant roles
            if (!syncState.isOnline && (user?.role === 'super_admin' || user?.role === 'receptionist')) {
                toast.success('Connection restored - syncing data...');
            }

            // Trigger sync when coming back online
            debouncedSync();
        };

        const handleOffline = () => {
            setSyncState(prev => ({ ...prev, isOnline: false, isSyncing: false }));

            // Cancel any pending sync
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
            syncInProgressRef.current = false;

            // Only show offline notification to relevant roles
            if (user?.role === 'super_admin' || user?.role === 'receptionist') {
                toast.warning('Working offline - changes will sync when connection is restored');
            }
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

    // Monitor pending sync operations
    useEffect(() => {
        const checkPendingSync = async () => {
            try {
                const stats = await connectionManager.getStats();
                setSyncState(prev => ({
                    ...prev,
                    pendingSync: stats.pendingOperations,
                    hasUnsyncedChanges: stats.pendingOperations > 0
                }));
            } catch (error) {
                console.warn('Failed to check pending sync operations:', error);
            }
        };

        // Check immediately and then every 30 seconds
        checkPendingSync();
        const interval = setInterval(checkPendingSync, 30000);

        return () => clearInterval(interval);
    }, []);

    // Force sync function for manual sync
    const forceSync = useCallback(async () => {
        if (!navigator.onLine) {
            toast.error('Cannot sync while offline');
            return;
        }

        if (syncInProgressRef.current) {
            toast.info('Sync already in progress...');
            return;
        }

        try {
            syncInProgressRef.current = true;
            setSyncState(prev => ({ ...prev, isSyncing: true, syncError: null }));

            // Show sync started notification only to relevant roles
            if (user?.role === 'super_admin' || user?.role === 'receptionist') {
                toast.info('Starting manual sync...');
            }

            await connectionManager.forcSync();

            setSyncState(prev => ({
                ...prev,
                isSyncing: false,
                lastSyncTime: new Date(),
                hasUnsyncedChanges: false
            }));

            // Show success notification only to relevant roles
            if (user?.role === 'super_admin' || user?.role === 'receptionist') {
                toast.success('Sync completed successfully');
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Sync failed';
            setSyncState(prev => ({
                ...prev,
                isSyncing: false,
                syncError: errorMessage
            }));

            // Show error notification only to relevant roles
            if (user?.role === 'super_admin' || user?.role === 'receptionist') {
                toast.error(`Manual sync failed: ${errorMessage}`);
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
