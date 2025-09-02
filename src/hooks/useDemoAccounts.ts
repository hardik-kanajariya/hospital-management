import { useState, useEffect } from 'react';
import { httpService } from '@/services/HttpService';
import config from '@/config/app';

interface DemoAccount {
    email: string;
    label: string;
    role: string;
    accessLevel: number;
}

export const useDemoAccounts = () => {
    const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDemoAccounts = async () => {
        // Check environment flag first
        if (!config.features.showDemoAccounts) {
            setDemoAccounts([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await httpService.get('/auth/demo-accounts');

            if (response.success && Array.isArray(response.data)) {
                setDemoAccounts(response.data);
            } else {
                setDemoAccounts([]);
            }
        } catch (err) {
            console.error('Failed to fetch demo accounts:', err);
            setError('Failed to load demo accounts');
            setDemoAccounts([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDemoAccounts();
    }, []);

    return {
        demoAccounts,
        isLoading,
        error,
        refresh: fetchDemoAccounts
    };
};
