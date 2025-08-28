import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

export function useNavigation() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const { isAuthenticated } = useAuth();

    // Handle navigation based on authentication state
    useEffect(() => {
        console.log('useNavigation effect - Auth:', isAuthenticated, 'Current Tab:', activeTab);

        if (isAuthenticated) {
            // User is authenticated, ensure they're on a valid tab
            if (activeTab === 'landing' || activeTab === 'login' || !activeTab) {
                console.log('Redirecting authenticated user to dashboard');
                setActiveTab('dashboard');
            }
        } else {
            // User is not authenticated, redirect to landing
            console.log('User not authenticated, redirecting to landing');
            setActiveTab('landing');
        }
    }, [isAuthenticated, activeTab]);

    return { activeTab, setActiveTab };
}
