import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { User, UserRole, ROLE_CONFIGS } from '@/types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useKV<AuthState>('auth-state', {
    user: null,
    isAuthenticated: false,
    isLoading: false
  });

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Simulate API call - in real implementation, this would call your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, create a user based on email
      const userRole = getUserRoleFromEmail(email);
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

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });

      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Invalid credentials' };
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
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