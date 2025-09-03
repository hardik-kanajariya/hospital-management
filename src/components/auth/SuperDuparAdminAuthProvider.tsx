import React, { useState, useEffect, createContext, ReactNode } from 'react';
import {
    authHelpers,
    SuperDuparAdmin,
    SuperDuparAdminAuthState,
    SuperDuparAdminAuthContextType
} from '@/hooks/useSuperDuparAdminAuth';

export const SuperDuparAdminAuthContext = createContext<SuperDuparAdminAuthContextType | undefined>(undefined);

interface SuperDuparAdminAuthProviderProps {
    children: ReactNode;
}

export const SuperDuparAdminAuthProvider: React.FC<SuperDuparAdminAuthProviderProps> = ({ children }) => {
    const [authState, setAuthState] = useState<SuperDuparAdminAuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true
    });
    const [error, setError] = useState<string | null>(null);

    // Initialize auth state on mount
    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            const initialState = await authHelpers.initializeAuth();
            setAuthState(initialState);

            // If user is found, verify token is still valid
            if (initialState.user && initialState.isAuthenticated) {
                try {
                    await refreshUser();
                } catch (err) {
                    // Token invalid, clear storage
                    clearAuth();
                }
            }
        } catch (err) {
            console.error('Auth initialization error:', err);
            clearAuth();
        }
    };

    const clearAuth = () => {
        authHelpers.clearAuth();
        setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
        });
    };

    const login = async (email: string, password: string): Promise<SuperDuparAdmin> => {
        try {
            setError(null);
            setAuthState(prev => ({ ...prev, isLoading: true }));

            const user = await authHelpers.login(email, password);

            // Update auth state
            setAuthState({
                user,
                isAuthenticated: true,
                isLoading: false
            });

            return user;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed';
            setError(errorMessage);

            // Reset auth state on error
            clearAuth();
            throw new Error(errorMessage);
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await authHelpers.logout();
        } catch (err) {
            console.warn('Logout request failed:', err);
        } finally {
            clearAuth();
            setError(null);
        }
    };

    const refreshUser = async (): Promise<void> => {
        try {
            const user = await authHelpers.refreshUser();
            setAuthState(prev => ({
                ...prev,
                user,
                isAuthenticated: true
            }));
        } catch (err) {
            console.error('Failed to refresh user:', err);
            clearAuth();
            throw err;
        }
    };

    const value: SuperDuparAdminAuthContextType = {
        ...authState,
        login,
        logout,
        refreshUser,
        error
    };

    return (
        <SuperDuparAdminAuthContext.Provider value={value}>
            {children}
        </SuperDuparAdminAuthContext.Provider>
    );
};
