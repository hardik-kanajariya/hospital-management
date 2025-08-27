import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock } from '@phosphor-icons/react';

interface RoleBasedAccessProps {
  children: ReactNode;
  requiredRole?: string | string[];
  requiredModule?: string;
  requiredAction?: 'create' | 'read' | 'update' | 'delete';
  fallback?: ReactNode;
  showMessage?: boolean;
}

export default function RoleBasedAccess({
  children,
  requiredRole,
  requiredModule,
  requiredAction = 'read',
  fallback,
  showMessage = true
}: RoleBasedAccessProps) {
  const { user, hasPermission } = useAuth();

  // Check role-based access
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!user || !allowedRoles.includes(user.role)) {
      if (fallback) return <>{fallback}</>;
      if (showMessage) {
        return (
          <Alert className="border-destructive">
            <Lock className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              Access denied. This feature requires {Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole} role.
            </AlertDescription>
          </Alert>
        );
      }
      return null;
    }
  }

  // Check permission-based access
  if (requiredModule && !hasPermission(requiredModule, requiredAction)) {
    if (fallback) return <>{fallback}</>;
    if (showMessage) {
      return (
        <Alert className="border-destructive">
          <Shield className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            Access denied. You don't have permission to {requiredAction} {requiredModule}.
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  }

  return <>{children}</>;
}