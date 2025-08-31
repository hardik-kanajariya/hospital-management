import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function useNavigation() {
    const navigate = useNavigate();
    const location = useLocation();

    // Get current active tab from URL
    const activeTab = location.pathname.slice(1) || 'landing';

    // Navigate to specific tab
    const setActiveTab = useCallback((tab: string) => {
        navigate(`/${tab}`);
    }, [navigate]);

    // Force update to dashboard when user logs in
    const navigateToDashboard = useCallback(() => {
        navigate('/dashboard');
    }, [navigate]);

    return {
        activeTab,
        setActiveTab,
        navigateToDashboard
    };
}
