import { useState, useEffect } from 'react';
import { httpService } from '@/services/HttpService';
import { User, UserRole, ROLE_CONFIGS } from '@/types/auth';

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
      console.log('Login attempt for:', email, 'isOnline:', navigator.onLine);

      // Check if user is online
      if (!navigator.onLine) {
        throw new Error('Internet connection is required for authentication. Please check your connection and try again.');
      }

      // Attempt HTTP authentication
      console.log('Attempting HTTP authentication...');
      const authResponse = await httpService.authenticate(email, password);
      console.log('HTTP authentication successful:', authResponse);

      // Adapt the response to match User type
      const user: User = {
        ...authResponse.user,
        role: authResponse.user.role as UserRole,
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

      console.log('Auth state updated - user authenticated:', user.name, user.role);

      // Force a small delay to ensure state is properly updated
      await new Promise(resolve => setTimeout(resolve, 50));

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
      }
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      // Always clear local data
      clearUserData();

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });

      console.log('User logged out');
    }
  };

  // Permission checking
  const hasPermission = (permission: string): boolean => {
    if (!authState.user) return false;

    // Check if user has the specific permission
    return authState.user.permissions.some(p =>
      p.module === permission || p.module === '*'
    );
  };

  // Role checking
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!authState.user) return false;

    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(authState.user.role as UserRole);
  };

  // Check if user has admin privileges
  const isAdmin = (): boolean => {
    return hasRole('super_admin');
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