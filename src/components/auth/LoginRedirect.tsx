import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from './LoginForm';

/**
 * Component that redirects authenticated users away from login page
 * and automatically logs out users who shouldn't have access
 */
export default function LoginRedirect() {
    const { user, isAuthenticated, logout } = useAuth();

    useEffect(() => {
        // If user is authenticated and tries to access login, log them out
        if (isAuthenticated && user) {
            console.log('Authenticated user accessing login page - logging out');
            logout();
        }
    }, [isAuthenticated, user, logout]);

    // If authenticated, redirect to dashboard
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    // Otherwise show login form
    return <LoginForm />;
}
