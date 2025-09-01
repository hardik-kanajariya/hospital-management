import { useState, useCallback, useEffect } from 'react';
import { httpService } from '@/services/HttpService';
import { toast } from 'sonner';

/**
 * Base hook for API operations
 * Provides loading states, error handling, and data management
 */
export function useApiRequest<T = any>(endpoint: string) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch data from API
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await httpService.get<T[]>(endpoint);

            if (response.success && response.data) {
                // Handle paginated data structure
                if (response.data && typeof response.data === 'object' && 'data' in response.data) {
                    // Paginated response: { data: { data: [...], meta: {...} } }
                    const paginatedData = response.data as any;
                    setData(Array.isArray(paginatedData.data) ? paginatedData.data : []);
                } else {
                    // Direct array response
                    setData(Array.isArray(response.data) ? response.data : []);
                }
            } else {
                throw new Error(response.error || 'Failed to fetch data');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
            setError(errorMessage);
            console.error(`Error fetching ${endpoint}:`, err);
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    // Initial data fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Create new record
    const createRecord = useCallback(async (record: Omit<T, 'id'>) => {
        try {
            setLoading(true);
            const response = await httpService.post<T>(endpoint, record);

            if (response.success && response.data) {
                setData(prev => [...prev, response.data as T]);
                toast.success('Record created successfully');
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to create record');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create record';
            toast.error(`Error: ${errorMessage}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    // Update existing record
    const updateRecord = useCallback(async (id: string | number, updates: Partial<T>) => {
        try {
            setLoading(true);
            const response = await httpService.put<T>(`${endpoint}/${id}`, updates);

            if (response.success) {
                setData(prev => prev.map(item =>
                    (item as any).id === id ? { ...item, ...updates } : item
                ));
                toast.success('Record updated successfully');
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to update record');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update record';
            toast.error(`Error: ${errorMessage}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    // Delete record
    const deleteRecord = useCallback(async (id: string | number) => {
        try {
            setLoading(true);
            const response = await httpService.delete(`${endpoint}/${id}`);

            if (response.success) {
                setData(prev => prev.filter(item => (item as any).id !== id));
                toast.success('Record deleted successfully');
            } else {
                throw new Error(response.error || 'Failed to delete record');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete record';
            toast.error(`Error: ${errorMessage}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    // Refresh data
    const refresh = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        createRecord,
        updateRecord,
        deleteRecord,
        refresh
    };
}