import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';

export function useNavigation() {
    const [activeTab, setActiveTab] = useState('landing');
    const { isAuthenticated, user } = useAuth();

    // Handle navigation based on authentication state
    useEffect(() => {
        console.log('useNavigation effect - Auth:', isAuthenticated, 'Current Tab:', activeTab, 'User:', user?.name);

        if (isAuthenticated && user) {
            // User is authenticated, ensure they're on a valid tab
            if (activeTab === 'landing' || activeTab === 'login') {
                console.log('Redirecting authenticated user to dashboard');
                setActiveTab('dashboard');
            }
        } else {
            // User is not authenticated, redirect to landing
            if (activeTab !== 'landing') {
                console.log('User not authenticated, redirecting to landing');
                setActiveTab('landing');
            }
        }
    }, [isAuthenticated, user]);

    // Force update to dashboard when user logs in
    const navigateToDashboard = useCallback(() => {
        console.log('Forcing navigation to dashboard');
        setActiveTab('dashboard');
    }, []);

    return {
        activeTab,
        setActiveTab,
        navigateToDashboard
    };
}
