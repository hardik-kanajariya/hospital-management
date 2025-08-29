import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export function useNavigation() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();

    // Get current active tab from URL
    const activeTab = location.pathname.slice(1) || 'landing';

    // Handle navigation based on authentication state
    useEffect(() => {
        console.log('useNavigation effect - Auth:', isAuthenticated, 'Current Path:', location.pathname, 'User:', user?.name);

        if (isAuthenticated && user) {
            // User is authenticated, ensure they're on a valid page
            if (location.pathname === '/' || location.pathname === '/landing' || location.pathname === '/login') {
                console.log('Redirecting authenticated user to dashboard');
                navigate('/dashboard', { replace: true });
            }
        } else {
            // User is not authenticated, redirect to landing if on protected route
            const protectedRoutes = ['/dashboard', '/patients', '/appointments', '/records', '/doctors', '/lab', '/beds', '/billing', '/inventory', '/notifications', '/users'];
            if (protectedRoutes.includes(location.pathname)) {
                console.log('User not authenticated, redirecting to landing');
                navigate('/landing', { replace: true });
            }
        }
    }, [isAuthenticated, user, location.pathname, navigate]);

    // Navigate to specific tab
    const setActiveTab = useCallback((tab: string) => {
        navigate(`/${tab}`);
    }, [navigate]);

    // Force update to dashboard when user logs in
    const navigateToDashboard = useCallback(() => {
        console.log('Forcing navigation to dashboard');
        navigate('/dashboard');
    }, [navigate]);

    return {
        activeTab,
        setActiveTab,
        navigateToDashboard
    };
}
