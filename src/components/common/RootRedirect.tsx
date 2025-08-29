import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const RootRedirect: React.FC = () => {
    const { isAuthenticated } = useAuth();

    // If authenticated, go to dashboard, otherwise go to landing
    return <Navigate to={isAuthenticated ? "/dashboard" : "/landing"} replace />;
};

export default RootRedirect;
