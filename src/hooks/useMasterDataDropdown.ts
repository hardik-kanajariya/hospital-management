import { useState, useCallback } from 'react'
import { API_ENDPOINTS } from '@/lib/api-endpoints'
import { httpService } from '@/services/HttpService'
import { toast } from 'sonner'

interface MasterDataItem {
    id: string
    name: string
    value: string
    description?: string
    category: string
    display_order: number
    is_active: boolean
    is_system: boolean
    created_at: string
    updated_at: string
}

interface UseMasterDataApiReturn {
    loading: boolean
    getMasterDataByCategory: (category: string) => Promise<MasterDataItem[]>
    createMasterDataItem: (data: Partial<MasterDataItem>) => Promise<MasterDataItem>
    updateMasterDataItem: (id: string, data: Partial<MasterDataItem>) => Promise<MasterDataItem>
    deleteMasterDataItem: (id: string) => Promise<void>
    toggleMasterDataStatus: (id: string) => Promise<void>
}

export function useMasterDataApi(): UseMasterDataApiReturn {
    const [loading, setLoading] = useState(false)

    const getMasterDataByCategory = useCallback(async (category: string): Promise<MasterDataItem[]> => {
        try {
            setLoading(true)
            const response = await httpService.get(API_ENDPOINTS.MASTER_DATA.BY_CATEGORY(category))

            if (response.success) {
                return response.data || []
            } else {
                throw new Error(response.message || 'Failed to fetch master data')
            }
        } catch (error) {
            console.error('Error fetching master data by category:', error)
            toast.error('Failed to load master data')
            return []
        } finally {
            setLoading(false)
        }
    }, [])

    const createMasterDataItem = useCallback(async (data: Partial<MasterDataItem>): Promise<MasterDataItem> => {
        try {
            setLoading(true)
            const response = await httpService.post(API_ENDPOINTS.MASTER_DATA.BASE, data)

            if (response.success) {
                toast.success('Master data item created successfully')
                return response.data
            } else {
                throw new Error(response.message || 'Failed to create master data item')
            }
        } catch (error) {
            console.error('Error creating master data item:', error)
            toast.error('Failed to create master data item')
            throw error
        } finally {
            setLoading(false)
        }
    }, [])

    const updateMasterDataItem = useCallback(async (id: string, data: Partial<MasterDataItem>): Promise<MasterDataItem> => {
        try {
            setLoading(true)
            const response = await httpService.put(API_ENDPOINTS.MASTER_DATA.BY_ID(id), data)

            if (response.success) {
                toast.success('Master data item updated successfully')
                return response.data
            } else {
                throw new Error(response.message || 'Failed to update master data item')
            }
        } catch (error) {
            console.error('Error updating master data item:', error)
            toast.error('Failed to update master data item')
            throw error
        } finally {
            setLoading(false)
        }
    }, [])

    const deleteMasterDataItem = useCallback(async (id: string): Promise<void> => {
        try {
            setLoading(true)
            const response = await httpService.delete(API_ENDPOINTS.MASTER_DATA.BY_ID(id))

            if (response.success) {
                toast.success('Master data item deleted successfully')
            } else {
                throw new Error(response.message || 'Failed to delete master data item')
            }
        } catch (error) {
            console.error('Error deleting master data item:', error)
            toast.error('Failed to delete master data item')
            throw error
        } finally {
            setLoading(false)
        }
    }, [])

    const toggleMasterDataStatus = useCallback(async (id: string): Promise<void> => {
        try {
            setLoading(true)
            const response = await httpService.put(API_ENDPOINTS.MASTER_DATA.TOGGLE_STATUS(id), {})

            if (response.success) {
                toast.success('Master data status updated successfully')
            } else {
                throw new Error(response.message || 'Failed to toggle master data status')
            }
        } catch (error) {
            console.error('Error toggling master data status:', error)
            toast.error('Failed to update master data status')
            throw error
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        loading,
        getMasterDataByCategory,
        createMasterDataItem,
        updateMasterDataItem,
        deleteMasterDataItem,
        toggleMasterDataStatus
    }
}
