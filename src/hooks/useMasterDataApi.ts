import { useState, useCallback, useEffect } from 'react';
import { httpService } from '@/services/HttpService';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { toast } from 'sonner';

interface MasterDataItem {
    id: string;
    name: string;
    description?: string;
    category: string;
    value?: string;
    display_order: number;
    is_system: boolean;
    is_active: boolean;
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

interface MasterDataCreateRequest {
    name: string;
    description?: string;
    category: string;
    value?: string;
    display_order?: number;
    is_active?: boolean;
    metadata?: Record<string, any>;
}

interface MasterDataSearchParams {
    category?: string;
    is_active?: boolean;
    is_system?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export function useMasterDataApi() {
    const [masterData, setMasterData] = useState<MasterDataItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Fetch master data
    const fetchMasterData = useCallback(async (params?: MasterDataSearchParams) => {
        setLoading(true);
        setError(null);

        try {
            // Build query string from params
            const queryParams = new URLSearchParams();
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        queryParams.append(key, String(value));
                    }
                });
            }

            const queryString = queryParams.toString();
            const endpoint = queryString ? `${API_ENDPOINTS.MASTER_DATA.BASE}?${queryString}` : API_ENDPOINTS.MASTER_DATA.BASE;

            const response = await httpService.get<{
                data: MasterDataItem[];
                meta: typeof pagination;
            }>(endpoint);

            if (response.success && response.data) {
                if (Array.isArray(response.data)) {
                    setMasterData(response.data);
                } else if (response.data.data) {
                    setMasterData(response.data.data);
                    if (response.data.meta) {
                        setPagination(response.data.meta);
                    }
                }
            } else {
                throw new Error(response.error || 'Failed to fetch master data');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch master data';
            setError(errorMessage);
            console.error('Error fetching master data:', err);
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, []);

    // Create master data item
    const createMasterDataItem = useCallback(async (itemData: MasterDataCreateRequest) => {
        try {
            setLoading(true);
            const response = await httpService.post<MasterDataItem>(API_ENDPOINTS.MASTER_DATA.BASE, itemData);

            if (response.success && response.data) {
                setMasterData(prev => [response.data!, ...prev]);
                toast.success('Master data item created successfully');
                return response.data;
            } else {
                console.error('❌ API call unsuccessful:', response);
                throw new Error(response.error || 'Failed to create master data item');
            }
        } catch (err) {
            console.error('🚨 Error in createMasterDataItem:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to create master data item';
            console.error('🚨 Error message:', errorMessage);
            toast.error(`Error: ${errorMessage}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update master data item
    const updateMasterDataItem = useCallback(async (id: string, updates: Partial<MasterDataCreateRequest>) => {
        try {
            setLoading(true);
            const response = await httpService.put<MasterDataItem>(API_ENDPOINTS.MASTER_DATA.BY_ID(id), updates);

            if (response.success && response.data) {
                setMasterData(prev => prev.map(item =>
                    item.id === id ? { ...item, ...response.data } : item
                ));
                toast.success('Master data item updated successfully');
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to update master data item');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update master data item';
            toast.error(`Error: ${errorMessage}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Toggle active status
    const toggleMasterDataStatus = useCallback(async (id: string) => {
        try {
            setLoading(true);
            const response = await httpService.patch<MasterDataItem>(API_ENDPOINTS.MASTER_DATA.TOGGLE_STATUS(id), {});

            if (response.success && response.data) {
                setMasterData(prev => prev.map(item =>
                    item.id === id ? { ...item, is_active: !item.is_active } : item
                ));
                toast.success('Status updated successfully');
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to update status');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
            toast.error(`Error: ${errorMessage}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get master data by category
    const getMasterDataByCategory = useCallback(async (category: string) => {
        setLoading(true);
        setError(null);

        try {
            const endpoint = API_ENDPOINTS.MASTER_DATA.BY_CATEGORY(category);
            const response = await httpService.get<{
                data: MasterDataItem[];
            }>(endpoint);

            if (response.success && response.data) {
                const categoryData = Array.isArray(response.data) ? response.data : response.data.data || [];
                // Update the masterData state with new category data
                setMasterData(prev => {
                    // Remove existing items of this category and add new ones
                    const filtered = prev.filter(item => item.category !== category);
                    return [...filtered, ...categoryData];
                });
                return categoryData;
            } else {
                throw new Error(response.error || 'Failed to fetch master data');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch master data';
            setError(errorMessage);
            console.error('Error fetching master data by category:', err);
            toast.error(`Error: ${errorMessage}`);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Get active master data items for dropdowns
    const getActiveMasterData = useCallback((category: string) => {
        return masterData.filter(item => item.category === category && item.is_active);
    }, [masterData]);

    return {
        masterData,
        loading,
        error,
        pagination,
        fetchMasterData,
        createMasterDataItem,
        updateMasterDataItem,
        toggleMasterDataStatus,
        getMasterDataByCategory,
        getActiveMasterData,
        refreshMasterData: fetchMasterData
    };
}
