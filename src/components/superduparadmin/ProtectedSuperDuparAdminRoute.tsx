import React from 'react';
import { Navigate } from 'react-router-dom';
import { SuperDuparAdminAuthProvider, useSuperDuparAdminAuth } from '../../hooks/useSuperDuparAdminAuth';

interface ProtectedSuperDuparAdminRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
}

const ProtectedRouteContent: React.FC<{ 
    children: React.ReactNode; 
    requireAuth: boolean;
}> = ({ children, requireAuth }) => {
    const { user, isLoading } = useSuperDuparAdminAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // If authentication is required but user is not authenticated
    if (requireAuth && !user) {
        return <Navigate to="/super-dupar-admin/login" replace />;
    }

    // If user is authenticated but accessing login page
    if (!requireAuth && user) {
        return <Navigate to="/super-dupar-admin/dashboard" replace />;
    }

    return <>{children}</>;
};

const ProtectedSuperDuparAdminRoute: React.FC<ProtectedSuperDuparAdminRouteProps> = ({ 
    children, 
    requireAuth = true 
}) => {
    return (
        <SuperDuparAdminAuthProvider>
            <ProtectedRouteContent requireAuth={requireAuth}>
                {children}
            </ProtectedRouteContent>
        </SuperDuparAdminAuthProvider>
    );
};

export default ProtectedSuperDuparAdminRoute;
