import { ReactNode } from 'react';
import { useAuth } from '@/lib';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldIcon, LockIcon } from '@phosphor-icons/react';

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
    if (!user) return renderAccessDenied("Authentication required");

    // Handle new Role object structure
    const userRole = typeof user.role === 'object' ? user.role?.name : user.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return renderAccessDenied(`Access denied. This feature requires ${Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole} role.`);
    }
  }

  // Check permission-based access
  if (requiredModule && !hasPermission(requiredModule, requiredAction)) {
    return renderAccessDenied(`Access denied. You don't have permission to ${requiredAction} ${requiredModule}.`);
  }

  return <>{children}</>;

  function renderAccessDenied(message: string) {
    if (fallback) return <>{fallback}</>;
    if (showMessage) {
      return (
        <Alert className="border-destructive">
          <LockIcon className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            {message}
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  }
}