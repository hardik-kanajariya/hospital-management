import { useContext } from 'react';
import { httpService } from '@/services/HttpService';

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

const STORAGE_KEY = 'super_dupar_admin_token';
const USER_STORAGE_KEY = 'super_dupar_admin_user';

// Helper functions for auth operations
export const authHelpers = {
    setUserData: (user: SuperDuparAdmin, token?: string) => {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        if (token) {
            localStorage.setItem(STORAGE_KEY, token);
        }
    },

    clearAuth: () => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
    },

    makeAuthenticatedRequest: async (url: string, options: { method?: string; data?: any } = {}) => {
        const token = localStorage.getItem(STORAGE_KEY);

        if (token) {
            // Temporarily set the token for this request
            const originalToken = httpService.getToken();
            httpService.setToken(token);

            try {
                let response;
                const { method = 'GET', data } = options;

                switch (method.toUpperCase()) {
                    case 'POST':
                        response = await httpService.post(url, data);
                        break;
                    case 'PUT':
                        response = await httpService.put(url, data);
                        break;
                    case 'PATCH':
                        response = await httpService.patch(url, data);
                        break;
                    case 'DELETE':
                        response = await httpService.delete(url);
                        break;
                    default:
                        response = await httpService.get(url);
                }

                return response;
            } catch (error) {
                if (error instanceof Error && error.message.includes('HTTP 401')) {
                    authHelpers.clearAuth();
                    throw new Error('Authentication failed');
                }
                throw error;
            } finally {
                // Restore original token
                if (originalToken) {
                    httpService.setToken(originalToken);
                } else {
                    httpService.clearToken();
                }
            }
        } else {
            throw new Error('No authentication token found');
        }
    },

    initializeAuth: async (): Promise<SuperDuparAdminAuthState> => {
        try {
            const token = localStorage.getItem(STORAGE_KEY);
            const userData = localStorage.getItem(USER_STORAGE_KEY);

            if (token && userData) {
                const user = JSON.parse(userData);
                return {
                    user,
                    isAuthenticated: true,
                    isLoading: false
                };
            } else {
                return {
                    user: null,
                    isAuthenticated: false,
                    isLoading: false
                };
            }
        } catch (err) {
            console.error('Auth initialization error:', err);
            authHelpers.clearAuth();
            return {
                user: null,
                isAuthenticated: false,
                isLoading: false
            };
        }
    },

    login: async (email: string, password: string): Promise<SuperDuparAdmin> => {
        try {
            const response = await httpService.post('/super-dupar-admin/auth/login', {
                email,
                password
            });

            if (response.success && response.data?.user && response.data?.token) {
                const { user, token } = response.data;

                // Store authentication data
                authHelpers.setUserData(user, token.token);

                return user;
            } else {
                throw new Error(response.error || 'Invalid response format');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed';
            console.error('Super Dupar Admin authentication error:', errorMessage);

            // Reset auth state on error
            authHelpers.clearAuth();
            throw new Error(errorMessage);
        }
    },

    logout: async (): Promise<void> => {
        try {
            // Call logout endpoint using the makeAuthenticatedRequest
            await authHelpers.makeAuthenticatedRequest('/super-dupar-admin/auth/logout', {
                method: 'POST'
            });
        } catch (err) {
            console.warn('Logout request failed:', err);
        } finally {
            authHelpers.clearAuth();
        }
    },

    refreshUser: async (): Promise<SuperDuparAdmin> => {
        try {
            const response = await authHelpers.makeAuthenticatedRequest('/super-dupar-admin/me');

            if (response.success && response.data?.user) {
                const user = response.data.user;
                authHelpers.setUserData(user);
                return user;
            } else {
                throw new Error('Failed to refresh user data');
            }
        } catch (err) {
            console.error('Failed to refresh user:', err);
            authHelpers.clearAuth();
            throw err;
        }
    }
};

// Export types for use in the provider and components
export type {
    SuperDuparAdmin,
    AuthToken,
    SuperDuparAdminAuthState,
    SuperDuparAdminAuthContextType
};

export { STORAGE_KEY, USER_STORAGE_KEY };
