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
        userRole: user?.role,
        requiredRole,
        currentPath: location.pathname
    });

    // Show loading state if auth is still loading
    if (isLoading) {
        return <div>Loading...</div>;
    }

    // If not authenticated, redirect to login with return path
    if (!isAuthenticated) {
        console.log('Redirecting to login from:', location.pathname);
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If role is required and user doesn't have it, redirect to dashboard
    if (requiredRole && user?.role !== requiredRole) {
        console.log('User role mismatch, redirecting to dashboard');
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
