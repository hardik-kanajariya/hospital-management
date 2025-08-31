import { useState, useEffect } from 'react';
import { httpService } from '@/services/HttpService';
import { User, UserRole, Role } from '@/types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Utility function to safely set user data in localStorage
const setUserData = (user: User) => {
  try {
    localStorage.setItem('current_user', JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user data:', error);
  }
};

// Utility function to safely get user data from localStorage
const getUserData = (): User | null => {
  try {
    const userData = localStorage.getItem('current_user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Failed to parse user data:', error);
    localStorage.removeItem('current_user');
    return null;
  }
};

// Utility function to clear user data from localStorage
const clearUserData = () => {
  try {
    localStorage.removeItem('current_user');
    localStorage.removeItem('auth_token');
  } catch (error) {
    console.error('Failed to clear user data:', error);
  }
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
        return;
      }

      const userData = getUserData();
      if (userData) {
        // Set the token in the HTTP service
        httpService.setToken(token);

        setAuthState({
          user: userData,
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        // Token exists but no user data, clear everything
        clearUserData();
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<User> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    setError(null);

    try {
      // Check if user is online
      if (!navigator.onLine) {
        throw new Error('Internet connection is required for authentication. Please check your connection and try again.');
      }

      // Attempt HTTP authentication
      const authResponse = await httpService.authenticate(email, password);

      // Adapt the response to match User type - handle legacy string roles
      const user: User = {
        ...authResponse.user,
        role: typeof authResponse.user.role === 'string'
          ? undefined  // Legacy string role, will be migrated
          : authResponse.user.role, // New Role object
        roleId: (authResponse.user as any).roleId, // Handle potential missing roleId
        isActive: true,
        createdAt: new Date().toISOString(),
        permissions: authResponse.user.permissions || []
      };

      // Store user data safely
      setUserData(user);

      // Update auth state and force re-render
      setAuthState({
        user: user,
        isAuthenticated: true,
        isLoading: false
      });

      // Force a small delay to ensure state is properly updated
      await new Promise(resolve => setTimeout(resolve, 50));

      // After successful login, refresh the page to reload the application
      setTimeout(() => {
        // Check if there's a stored redirect path
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin');
          window.location.href = redirectPath;
        } else {
          window.location.href = '/dashboard';
        }
      }, 100);

      return user;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      console.error('Authentication error:', errorMessage);
      setError(errorMessage);

      // Reset auth state on error
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });

      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // Call logout endpoint if online
      if (navigator.onLine) {
        await httpService.logout();
      } else {
      }
    } catch (error) {
      console.warn('Logout request failed:', error);
      // Don't throw error - logout should always succeed locally
    } finally {
      // Always clear local data
      clearUserData();

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });

      // After successful logout, refresh the page to reload the application
      setTimeout(() => {
        window.location.href = '/landing';
      }, 100);
    }
  };

  // Permission checking
  const hasPermission = (permission: string, action: string = 'read'): boolean => {
    if (!authState.user) return false;

    // Check if user has the specific permission
    return authState.user.permissions.some(p => {
      // Check for wildcard permission (super admin)
      if (p.module === '*') return true;

      // Check for specific module permission with required action
      return p.module === permission && p.actions?.includes(action as any);
    });
  };

  // Role checking - works with both old string roles and new Role objects
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!authState.user || !authState.user.role) return false;

    const roles = Array.isArray(role) ? role : [role];

    // Handle new Role object structure
    if (typeof authState.user.role === 'object') {
      return roles.includes(authState.user.role.name as UserRole);
    }

    // Handle legacy string role structure
    return roles.includes(authState.user.role as UserRole);
  };

  // Check if user has admin privileges
  const isAdmin = (): boolean => {
    if (!authState.user || !authState.user.role) return false;

    // Handle new Role object structure
    if (typeof authState.user.role === 'object') {
      return authState.user.role.name === 'super_admin';
    }

    // Handle legacy string role structure
    return authState.user.role === 'super_admin';
  };

  // Clear any auth errors
  const clearError = () => setError(null);

  return {
    // Auth state
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error,

    // Auth actions
    login,
    logout,
    clearError,

    // Permission helpers
    hasPermission,
    hasRole,
    isAdmin
  };
}