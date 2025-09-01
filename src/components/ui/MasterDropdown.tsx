import React, { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { API_ENDPOINTS } from '@/lib/api-endpoints'
import { httpService } from '@/services/HttpService'

interface MasterDataItem {
    id: string
    name: string
    value: string
    description?: string
    display_order: number
    is_active: boolean
}

interface MasterDropdownProps {
    category: string
    value?: string
    onValueChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
    allowEmpty?: boolean
    emptyLabel?: string
    className?: string
    required?: boolean
}

// Cache for master data to avoid repeated API calls
const masterDataCache = new Map<string, MasterDataItem[]>()
const loadingCache = new Set<string>()

export function MasterDropdown({
    category,
    value,
    onValueChange,
    placeholder = "Select an option",
    disabled = false,
    allowEmpty = true,
    emptyLabel = "Not specified",
    className,
    required = false
}: MasterDropdownProps) {
    const [items, setItems] = useState<MasterDataItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchMasterData = async () => {
            // Check cache first
            if (masterDataCache.has(category)) {
                setItems(masterDataCache.get(category)!)
                return
            }

            // Prevent multiple simultaneous requests for the same category
            if (loadingCache.has(category)) {
                return
            }

            setLoading(true)
            setError(null)
            loadingCache.add(category)

            try {
                const response = await httpService.get(API_ENDPOINTS.MASTER_DATA.BY_CATEGORY(category))

                if (response.success) {
                    const sortedItems = response.data.sort((a: MasterDataItem, b: MasterDataItem) => {
                        // Sort by display_order first, then by name
                        if (a.display_order !== b.display_order) {
                            return a.display_order - b.display_order
                        }
                        return a.name.localeCompare(b.name)
                    })

                    setItems(sortedItems)
                    masterDataCache.set(category, sortedItems)
                } else {
                    setError(response.message || 'Failed to load options')
                }
            } catch (error) {
                console.error(`Error fetching master data for category ${category}:`, error)
                setError('Failed to load options')
            } finally {
                setLoading(false)
                loadingCache.delete(category)
            }
        }

        if (category) {
            fetchMasterData()
        }
    }, [category])

    // Handle loading state
    if (loading) {
        return (
            <div className={className}>
                <Skeleton className="h-10 w-full" />
            </div>
        )
    }

    // Handle error state
    if (error) {
        return (
            <Select disabled>
                <SelectTrigger className={className}>
                    <SelectValue placeholder="Error loading options" />
                </SelectTrigger>
            </Select>
        )
    }

    return (
        <Select
            value={value}
            onValueChange={onValueChange}
            disabled={disabled}
            required={required}
        >
            <SelectTrigger className={className}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {allowEmpty && (
                    <SelectItem value="0">{emptyLabel}</SelectItem>
                )}
                {items.map((item) => (
                    <SelectItem key={item.id} value={item.name}>
                        {item.name}
                    </SelectItem>
                ))}
                {items.length === 0 && !loading && (
                    <SelectItem value="0" disabled>
                        No options available
                    </SelectItem>
                )}
            </SelectContent>
        </Select>
    )
}

// Hook for clearing cache when master data is updated
export const useMasterDataCache = () => {
    const clearCache = (category?: string) => {
        if (category) {
            masterDataCache.delete(category)
        } else {
            masterDataCache.clear()
        }
    }

    const refreshCategory = async (category: string) => {
        clearCache(category)
        // Force re-fetch by creating a temporary component (this will trigger useEffect)
    }

    return { clearCache, refreshCategory }
}

export default MasterDropdown
