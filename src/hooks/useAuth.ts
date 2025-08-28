import { useState, useEffect } from 'react';
import { db } from '@/lib/database';
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
    localStorage.setItem('auth_token', 'authenticated');
  } catch (error) {
    console.error('Failed to save user data:', error);
  }
};

// Utility function to safely clear user data
const clearUserData = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('current_user');
};

// Utility function to reset authentication state completely
const resetAuthState = () => {
  clearUserData();
  // Also clear any other auth-related localStorage items that might exist
  Object.keys(localStorage).forEach(key => {
    if (key.includes('auth') || key.includes('user') || key.includes('token')) {
      localStorage.removeItem(key);
    }
  });
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false
  });

  // Clear invalid localStorage data on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('current_user');

    // Clear invalid data
    if (savedUser === 'undefined' || savedUser === 'null') {
      clearUserData();
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('current_user');

    if (token && savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Additional validation to ensure the parsed user has required properties
        if (parsedUser && typeof parsedUser === 'object' && parsedUser.id) {
          setAuthState({
            user: parsedUser,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          // Invalid user object, clear storage
          clearUserData();
        }
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        clearUserData();
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      if (db.isOnline()) {
        // Try database authentication first
        const authenticatedUser = await db.authenticate(email, password);

        // Store user data safely
        setUserData(authenticatedUser);

        setAuthState({
          user: authenticatedUser,
          isAuthenticated: true,
          isLoading: false
        });

        return { success: true };
      } else {
        // Offline mode - use demo users
        const userRole = getUserRoleFromEmail(email);

        // Simple password check for demo (admin123 for all demo accounts)
        if (password === 'admin123') {
          const user: User = {
            id: crypto.randomUUID(),
            email,
            name: getNameFromEmail(email),
            role: userRole,
            isActive: true,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            permissions: ROLE_CONFIGS.find(r => r.role === userRole)?.permissions || []
          };

          // Store user data safely
          setUserData(user);

          console.log('Login successful - Setting auth state:', user);

          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false
          });

          console.log('Auth state updated - isAuthenticated: true');

          return { success: true };
        }
      }

      throw new Error('Invalid credentials');
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error instanceof Error ? error.message : 'Authentication failed' };
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });

    // Clear stored data safely
    clearUserData();

    // Logout from database
    db.logout();
  };

  const hasPermission = (module: string, action: 'create' | 'read' | 'update' | 'delete'): boolean => {
    if (!authState.user) return false;

    // Super admin has all permissions
    if (authState.user.role === 'super_admin') return true;

    const userPermissions = authState.user.permissions;

    // Check for wildcard permission
    const wildcardPermission = userPermissions.find(p => p.module === '*');
    if (wildcardPermission && wildcardPermission.actions.includes(action)) return true;

    // Check for specific module permission
    const modulePermission = userPermissions.find(p => p.module === module);
    return modulePermission ? modulePermission.actions.includes(action) : false;
  };

  const canAccessModule = (module: string): boolean => {
    return hasPermission(module, 'read');
  };

  return {
    ...authState,
    login,
    logout,
    hasPermission,
    canAccessModule
  };
}

// Helper functions for demo data
function getUserRoleFromEmail(email: string): UserRole {
  if (email.includes('admin')) return 'super_admin';
  if (email.includes('doctor') || email.includes('dr')) return 'doctor';
  if (email.includes('billing')) return 'billing_manager';
  if (email.includes('nurse')) return 'nurse';
  if (email.includes('lab')) return 'lab_technician';
  if (email.includes('pharmacy') || email.includes('pharma')) return 'pharmacist';
  if (email.includes('store')) return 'medical_store_manager';
  return 'receptionist';
}

function getNameFromEmail(email: string): string {
  const name = email.split('@')[0];
  return name.split('.').map(part =>
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join(' ');
}