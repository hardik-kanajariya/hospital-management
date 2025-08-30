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
        // If user is authenticated and tries to access login, redirect to dashboard
        if (isAuthenticated && user) {
            console.log('Authenticated user accessing login page - redirecting to dashboard');
            window.location.href = '/dashboard';
        }
    }, [isAuthenticated, user]);

    // If authenticated, the useEffect will handle the redirect
    if (isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Redirecting...</p>
                </div>
            </div>
        );
    }

    // Otherwise show login form
    return <LoginForm />;
}
