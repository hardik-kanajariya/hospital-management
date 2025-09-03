import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface SuperDuparAdmin {
    id: string;
    email: string;
    name: string;
    phone?: string;
    isActive: boolean;
    lastLoginAt?: string;
    role: string;
    permissions: string[];
    settings?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

interface AuthToken {
    type: string;
    token: string;
    expiresAt: string;
}

interface SuperDuparAdminAuthState {
    user: SuperDuparAdmin | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

interface SuperDuparAdminAuthContextType extends SuperDuparAdminAuthState {
    login: (email: string, password: string) => Promise<SuperDuparAdmin>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    error: string | null;
}

const SuperDuparAdminAuthContext = createContext<SuperDuparAdminAuthContextType | undefined>(undefined);

const STORAGE_KEY = 'super_dupar_admin_token';
const USER_STORAGE_KEY = 'super_dupar_admin_user';

export const SuperDuparAdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
            const token = localStorage.getItem(STORAGE_KEY);
            const userData = localStorage.getItem(USER_STORAGE_KEY);

            if (token && userData) {
                const user = JSON.parse(userData);
                setAuthState({
                    user,
                    isAuthenticated: true,
                    isLoading: false
                });

                // Verify token is still valid
                try {
                    await refreshUser();
                } catch (err) {
                    // Token invalid, clear storage
                    clearAuth();
                }
            } else {
                setAuthState({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false
                });
            }
        } catch (err) {
            console.error('Auth initialization error:', err);
            clearAuth();
        }
    };

    const setUserData = (user: SuperDuparAdmin, token?: string) => {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        if (token) {
            localStorage.setItem(STORAGE_KEY, token);
        }
    };

    const clearAuth = () => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
        });
    };

    const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
        const token = localStorage.getItem(STORAGE_KEY);

        const response = await fetch(`/api${url}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                clearAuth();
                throw new Error('Authentication failed');
            }
            throw new Error(`Request failed: ${response.statusText}`);
        }

        return response.json();
    };

    const login = async (email: string, password: string): Promise<SuperDuparAdmin> => {
        try {
            setError(null);
            setAuthState(prev => ({ ...prev, isLoading: true }));

            const response = await fetch('/api/super-dupar-admin/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            if (data.success && data.data?.user && data.data?.token) {
                const { user, token } = data.data;
                
                // Store authentication data
                setUserData(user, token.token);
                
                // Update auth state
                setAuthState({
                    user,
                    isAuthenticated: true,
                    isLoading: false
                });

                return user;
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed';
            console.error('Super Dupar Admin authentication error:', errorMessage);
            setError(errorMessage);

            // Reset auth state on error
            clearAuth();
            throw new Error(errorMessage);
        }
    };

    const logout = async (): Promise<void> => {
        try {
            // Call logout endpoint
            await makeAuthenticatedRequest('/super-dupar-admin/auth/logout', {
                method: 'POST'
            });
        } catch (err) {
            console.warn('Logout request failed:', err);
        } finally {
            clearAuth();
            setError(null);
        }
    };

    const refreshUser = async (): Promise<void> => {
        try {
            const response = await makeAuthenticatedRequest('/super-dupar-admin/me');

            if (response.success && response.data?.user) {
                const user = response.data.user;
                setUserData(user);
                setAuthState(prev => ({
                    ...prev,
                    user,
                    isAuthenticated: true
                }));
            } else {
                throw new Error('Failed to refresh user data');
            }
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

export const useSuperDuparAdminAuth = (): SuperDuparAdminAuthContextType => {
    const context = useContext(SuperDuparAdminAuthContext);
    if (context === undefined) {
        throw new Error('useSuperDuparAdminAuth must be used within a SuperDuparAdminAuthProvider');
    }
    return context;
};
