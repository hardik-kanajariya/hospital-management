import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRole
}) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();

    console.log('ProtectedRoute check:', {
        isAuthenticated,
        isLoading,
        userRole: user?.role?.name,
        userName: user?.name,
        requiredRole,
        currentPath: location.pathname,
        hasUser: !!user,
        timestamp: new Date().toISOString()
    });

    // Show loading state if auth is still loading
    if (isLoading) {
        console.log('ProtectedRoute: Showing loading state');
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, redirect to login with return path
    if (!isAuthenticated) {
        console.log('ProtectedRoute: User not authenticated, redirecting to login from:', location.pathname);
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If role is required and user doesn't have it, redirect to dashboard
    if (requiredRole && user?.role?.name !== requiredRole) {
        console.log('ProtectedRoute: User role mismatch, redirecting to dashboard. Required:', requiredRole, 'User role:', user?.role?.name);
        return <Navigate to="/dashboard" replace />;
    }

    console.log('ProtectedRoute: Access granted for user:', user?.name);
    return <>{children}</>;
};

export default ProtectedRoute;
