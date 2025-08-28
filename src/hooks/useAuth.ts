import { useState, useEffect } from 'react';
import { db } from '@/lib/database';
import { User, UserRole, ROLE_CONFIGS } from '@/types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false
  });

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('current_user');
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setAuthState({
          user: parsedUser,
          isAuthenticated: true,
          isLoading: false
        });
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      if (db.isOnline()) {
        // Try database authentication first
        const authenticatedUser = await db.authenticate(email, password);
        
        // Store user data
        localStorage.setItem('current_user', JSON.stringify(authenticatedUser));
        
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

          // Store user data
          localStorage.setItem('current_user', JSON.stringify(user));
          localStorage.setItem('auth_token', 'offline_token');

          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false
          });

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
    
    // Clear stored data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    
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