import { useState, useEffect, useCallback } from 'react';
import { httpService } from '@/services/HttpService';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

interface ConnectionState {
    isOnline: boolean;
    isConnected: boolean;
    checking: boolean;
    lastCheck: Date | null;
    error: string | null;
}

interface ConnectionHook {
    connectionState: ConnectionState;
    checkConnection: () => Promise<void>;
    clearError: () => void;
}

export function useConnectionStatus(): ConnectionHook {
    const { user } = useAuth();
    const [connectionState, setConnectionState] = useState<ConnectionState>({
        isOnline: navigator.onLine,
        isConnected: false,
        checking: false,
        lastCheck: null,
        error: null
    });

    // Check server connectivity
    const checkServerConnection = useCallback(async () => {
        try {
            const isHealthy = await httpService.checkHealth();
            setConnectionState(prev => ({
                ...prev,
                isConnected: isHealthy,
                lastCheck: new Date(),
                error: isHealthy ? null : 'Server is not responding'
            }));
            return isHealthy;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Connection check failed';
            setConnectionState(prev => ({
                ...prev,
                isConnected: false,
                lastCheck: new Date(),
                error: errorMessage
            }));
            return false;
        }
    }, []);

    // Manual connection check
    const checkConnection = useCallback(async () => {
        if (!navigator.onLine) {
            toast.error('No internet connection');
            return;
        }

        setConnectionState(prev => ({ ...prev, checking: true, error: null }));

        try {
            const isConnected = await checkServerConnection();

            if (isConnected) {
                toast.success('Connection verified');
            } else {
                toast.error('Server is not responding');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Connection check failed';
            toast.error(`Connection check failed: ${errorMessage}`);
        } finally {
            setConnectionState(prev => ({ ...prev, checking: false }));
        }
    }, [checkServerConnection]);

    // Handle online/offline events
    useEffect(() => {
        const handleOnline = () => {
            setConnectionState(prev => ({ ...prev, isOnline: true }));

            // Show notification to relevant users
            if (user?.role === 'super_admin' || user?.role === 'receptionist') {
                toast.success('Internet connection restored');
            }

            // Check server connection when back online
            checkServerConnection();
        };

        const handleOffline = () => {
            setConnectionState(prev => ({
                ...prev,
                isOnline: false,
                isConnected: false,
                checking: false
            }));

            // Show offline notification
            toast.error('Internet connection lost');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [checkServerConnection, user?.role]);

    // Initial connection check
    useEffect(() => {
        if (navigator.onLine) {
            checkServerConnection();
        }
    }, [checkServerConnection]);

    // Periodic connection check (every 2 minutes)
    useEffect(() => {
        const interval = setInterval(() => {
            if (navigator.onLine) {
                checkServerConnection();
            }
        }, 120000); // 2 minutes

        return () => clearInterval(interval);
    }, [checkServerConnection]);

    const clearError = useCallback(() => {
        setConnectionState(prev => ({ ...prev, error: null }));
    }, []);

    return {
        connectionState,
        checkConnection,
        clearError
    };
}
