import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    XIcon,
    BookmarkIcon,
    ClockIcon,
    CaretDownIcon,
    CaretUpIcon,
    UserIcon,
    CalendarIcon,
    MapPinIcon,
    HeartIcon,
    ShieldIcon,
    DownloadIcon,
    PrinterIcon
} from '@phosphor-icons/react'
import { Patient } from '@/types/patient'

interface AdvancedSearchFilters {
    // Basic filters
    name?: string
    phone?: string
    email?: string
    patient_id?: string

    // Date filters
    date_of_birth_from?: string
    date_of_birth_to?: string
    created_from?: string
    created_to?: string
    last_visit_from?: string
    last_visit_to?: string

    // Demographics
    gender?: string
    age_from?: number
    age_to?: number
    blood_group?: string
    address?: string
    city?: string
    state?: string
    postal_code?: string

    // Medical filters
    allergies?: string[]
    medications?: string[]
    conditions?: string[]
    insurance_provider?: string

    // Sort and pagination
    sort_by?: string
    sort_order?: 'asc' | 'desc'
    limit?: number
    page?: number
}

interface SavedSearch {
    id: string
    name: string
    filters: AdvancedSearchFilters
    created_at: string
}

interface AdvancedPatientSearchProps {
    onSearchResults: (patients: Patient[], totalCount: number) => void
    onLoading: (loading: boolean) => void
}

export default function AdvancedPatientSearch({ onSearchResults, onLoading }: AdvancedPatientSearchProps) {
    const [filters, setFilters] = useState<AdvancedSearchFilters>({
        sort_by: 'created_at',
        sort_order: 'desc',
        limit: 20,
        page: 1
    })

    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
    const [saveSearchName, setSaveSearchName] = useState('')
    const [isSearchLoading, setIsSearchLoading] = useState(false)
    const [quickFilters, setQuickFilters] = useState({
        hasAllergies: false,
        hasInsurance: false,
        recentVisit: false,
        requiresFollowup: false
    })

    // Load saved searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('savedPatientSearches')
        if (saved) {
            setSavedSearches(JSON.parse(saved))
        }
    }, [])

    // Perform search
    const performSearch = async () => {
        setIsSearchLoading(true)
        onLoading(true)

        try {
            const searchParams = new URLSearchParams()

            // Add all non-empty filters to search params
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== '' && value !== null) {
                    if (Array.isArray(value)) {
                        value.forEach(item => searchParams.append(`${key}[]`, item))
                    } else {
                        searchParams.append(key, String(value))
                    }
                }
            })

            const response = await fetch(`/api/patients/advanced-search?${searchParams}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Search failed')
            }

            const data = await response.json()
            if (data.success) {
                onSearchResults(data.data.data, data.data.meta.total)
                toast.success(`Found ${data.data.meta.total} patients`)
            } else {
                throw new Error(data.message || 'Search failed')
            }
        } catch (error) {
            console.error('Search error:', error)
            toast.error('Failed to search patients')
            onSearchResults([], 0)
        } finally {
            setIsSearchLoading(false)
            onLoading(false)
        }
    }

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            sort_by: 'created_at',
            sort_order: 'desc',
            limit: 20,
            page: 1
        })
        setQuickFilters({
            hasAllergies: false,
            hasInsurance: false,
            recentVisit: false,
            requiresFollowup: false
        })
    }

    // Save current search
    const saveCurrentSearch = () => {
        if (!saveSearchName.trim()) {
            toast.error('Please enter a name for the saved search')
            return
        }

        const newSavedSearch: SavedSearch = {
            id: Date.now().toString(),
            name: saveSearchName.trim(),
            filters: { ...filters },
            created_at: new Date().toISOString()
        }

        const updatedSaves = [...savedSearches, newSavedSearch]
        setSavedSearches(updatedSaves)
        localStorage.setItem('savedPatientSearches', JSON.stringify(updatedSaves))

        setSaveSearchName('')
        toast.success('Search saved successfully')
    }

    // Load saved search
    const loadSavedSearch = (savedSearch: SavedSearch) => {
        setFilters({ ...savedSearch.filters })
        toast.success(`Loaded search: ${savedSearch.name}`)
    }

    // Delete saved search
    const deleteSavedSearch = (searchId: string) => {
        const updatedSaves = savedSearches.filter(s => s.id !== searchId)
        setSavedSearches(updatedSaves)
        localStorage.setItem('savedPatientSearches', JSON.stringify(updatedSaves))
        toast.success('Saved search deleted')
    }

    // Export search results
    const exportResults = async (format: 'csv' | 'pdf') => {
        try {
            const searchParams = new URLSearchParams()
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== '' && value !== null) {
                    searchParams.append(key, String(value))
                }
            })
            searchParams.append('export', format)

            const response = await fetch(`/api/patients/export?${searchParams}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `patients_export_${Date.now()}.${format}`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
                toast.success(`Export completed (${format.toUpperCase()})`)
            } else {
                throw new Error('Export failed')
            }
        } catch (error) {
            console.error('Export error:', error)
            toast.error('Failed to export results')
        }
    }

    return (
        <Card className="w-full">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <MagnifyingGlassIcon className="w-5 h-5" />
                            Advanced Patient Search
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Use multiple criteria to find specific patients
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportResults('csv')}
                            className="text-xs"
                        >
                            <DownloadIcon className="w-4 h-4 mr-1" />
                            CSV
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportResults('pdf')}
                            className="text-xs"
                        >
                            <PrinterIcon className="w-4 h-4 mr-1" />
                            PDF
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Quick Search */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="name">Patient Name</Label>
                        <Input
                            id="name"
                            placeholder="Search by name..."
                            value={filters.name || ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>
                    <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            placeholder="Search by phone..."
                            value={filters.phone || ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, phone: e.target.value }))}
                        />
                    </div>
                    <div>
                        <Label htmlFor="patient_id">Patient ID</Label>
                        <Input
                            id="patient_id"
                            placeholder="Search by patient ID..."
                            value={filters.patient_id || ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, patient_id: e.target.value }))}
                        />
                    </div>
                </div>

                {/* Quick Filters */}
                <div className="flex flex-wrap gap-2">
                    <Badge
                        variant={quickFilters.hasAllergies ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setQuickFilters(prev => ({ ...prev, hasAllergies: !prev.hasAllergies }))}
                    >
                        <HeartIcon className="w-3 h-3 mr-1" />
                        Has Allergies
                    </Badge>
                    <Badge
                        variant={quickFilters.hasInsurance ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setQuickFilters(prev => ({ ...prev, hasInsurance: !prev.hasInsurance }))}
                    >
                        <ShieldIcon className="w-3 h-3 mr-1" />
                        Has Insurance
                    </Badge>
                    <Badge
                        variant={quickFilters.recentVisit ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setQuickFilters(prev => ({ ...prev, recentVisit: !prev.recentVisit }))}
                    >
                        <ClockIcon className="w-3 h-3 mr-1" />
                        Recent Visit
                    </Badge>
                    <Badge
                        variant={quickFilters.requiresFollowup ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setQuickFilters(prev => ({ ...prev, requiresFollowup: !prev.requiresFollowup }))}
                    >
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        Requires Follow-up
                    </Badge>
                </div>

                {/* Advanced Filters Collapsible */}
                <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                    <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                            <span className="flex items-center gap-2">
                                <FunnelIcon className="w-4 h-4" />
                                Advanced Filters
                            </span>
                            {isAdvancedOpen ? (
                                <CaretUpIcon className="w-4 h-4" />
                            ) : (
                                <CaretDownIcon className="w-4 h-4" />
                            )}
                        </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="space-y-4 mt-4">
                        <Tabs defaultValue="demographics" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="demographics">Demographics</TabsTrigger>
                                <TabsTrigger value="dates">Dates</TabsTrigger>
                                <TabsTrigger value="medical">Medical</TabsTrigger>
                                <TabsTrigger value="location">Location</TabsTrigger>
                            </TabsList>

                            <TabsContent value="demographics" className="space-y-4 mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="gender">Gender</Label>
                                        <Select
                                            value={filters.gender || ''}
                                            onValueChange={(value) => setFilters(prev => ({ ...prev, gender: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Genders</SelectItem>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="blood_group">Blood Group</Label>
                                        <Select
                                            value={filters.blood_group || ''}
                                            onValueChange={(value) => setFilters(prev => ({ ...prev, blood_group: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select blood group" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Blood Groups</SelectItem>
                                                <SelectItem value="A+">A+</SelectItem>
                                                <SelectItem value="A-">A-</SelectItem>
                                                <SelectItem value="B+">B+</SelectItem>
                                                <SelectItem value="B-">B-</SelectItem>
                                                <SelectItem value="AB+">AB+</SelectItem>
                                                <SelectItem value="AB-">AB-</SelectItem>
                                                <SelectItem value="O+">O+</SelectItem>
                                                <SelectItem value="O-">O-</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="insurance_provider">Insurance Provider</Label>
                                        <Input
                                            id="insurance_provider"
                                            placeholder="Insurance provider..."
                                            value={filters.insurance_provider || ''}
                                            onChange={(e) => setFilters(prev => ({ ...prev, insurance_provider: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="age_from">Age From</Label>
                                        <Input
                                            id="age_from"
                                            type="number"
                                            placeholder="Min age"
                                            value={filters.age_from || ''}
                                            onChange={(e) => setFilters(prev => ({ ...prev, age_from: Number(e.target.value) || undefined }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="age_to">Age To</Label>
                                        <Input
                                            id="age_to"
                                            type="number"
                                            placeholder="Max age"
                                            value={filters.age_to || ''}
                                            onChange={(e) => setFilters(prev => ({ ...prev, age_to: Number(e.target.value) || undefined }))}
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="dates" className="space-y-4 mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="date_of_birth_from">Date of Birth From</Label>
                                        <Input
                                            id="date_of_birth_from"
                                            type="date"
                                            value={filters.date_of_birth_from || ''}
                                            onChange={(e) => setFilters(prev => ({ ...prev, date_of_birth_from: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="date_of_birth_to">Date of Birth To</Label>
                                        <Input
                                            id="date_of_birth_to"
                                            type="date"
                                            value={filters.date_of_birth_to || ''}
                                            onChange={(e) => setFilters(prev => ({ ...prev, date_of_birth_to: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="created_from">Registration Date From</Label>
                                        <Input
                                            id="created_from"
                                            type="date"
                                            value={filters.created_from || ''}
                                            onChange={(e) => setFilters(prev => ({ ...prev, created_from: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="created_to">Registration Date To</Label>
                                        <Input
                                            id="created_to"
                                            type="date"
                                            value={filters.created_to || ''}
                                            onChange={(e) => setFilters(prev => ({ ...prev, created_to: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="medical" className="space-y-4 mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="allergies">Known Allergies</Label>
                                        <Input
                                            id="allergies"
                                            placeholder="Enter allergy (e.g., Penicillin)..."
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    const value = (e.target as HTMLInputElement).value
                                                    if (value.trim()) {
                                                        setFilters(prev => ({
                                                            ...prev,
                                                            allergies: [...(prev.allergies || []), value.trim()]
                                                        }));
                                                        (e.target as HTMLInputElement).value = ''
                                                    }
                                                }
                                            }}
                                        />
                                        {filters.allergies && filters.allergies.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {filters.allergies.map((allergy, index) => (
                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                        {allergy}
                                                        <XIcon
                                                            className="w-3 h-3 ml-1 cursor-pointer"
                                                            onClick={() => {
                                                                setFilters(prev => ({
                                                                    ...prev,
                                                                    allergies: prev.allergies?.filter((_, i) => i !== index)
                                                                }))
                                                            }}
                                                        />
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="medications">Current Medications</Label>
                                        <Input
                                            id="medications"
                                            placeholder="Enter medication (e.g., Aspirin)..."
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    const value = (e.target as HTMLInputElement).value
                                                    if (value.trim()) {
                                                        setFilters(prev => ({
                                                            ...prev,
                                                            medications: [...(prev.medications || []), value.trim()]
                                                        }));
                                                        (e.target as HTMLInputElement).value = ''
                                                    }
                                                }
                                            }}
                                        />
                                        {filters.medications && filters.medications.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {filters.medications.map((medication, index) => (
                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                        {medication}
                                                        <XIcon
                                                            className="w-3 h-3 ml-1 cursor-pointer"
                                                            onClick={() => {
                                                                setFilters(prev => ({
                                                                    ...prev,
                                                                    medications: prev.medications?.filter((_, i) => i !== index)
                                                                }))
                                                            }}
                                                        />
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="location" className="space-y-4 mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            placeholder="City..."
                                            value={filters.city || ''}
                                            onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="state">State</Label>
                                        <Input
                                            id="state"
                                            placeholder="State..."
                                            value={filters.state || ''}
                                            onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="postal_code">Postal Code</Label>
                                        <Input
                                            id="postal_code"
                                            placeholder="Postal code..."
                                            value={filters.postal_code || ''}
                                            onChange={(e) => setFilters(prev => ({ ...prev, postal_code: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CollapsibleContent>
                </Collapsible>

                {/* Saved Searches */}
                {savedSearches.length > 0 && (
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Saved Searches</Label>
                        <div className="flex flex-wrap gap-2">
                            {savedSearches.map((savedSearch) => (
                                <div key={savedSearch.id} className="flex items-center gap-1">
                                    <Badge
                                        variant="outline"
                                        className="cursor-pointer hover:bg-muted"
                                        onClick={() => loadSavedSearch(savedSearch)}
                                    >
                                        <BookmarkIcon className="w-3 h-3 mr-1" />
                                        {savedSearch.name}
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-6 w-6"
                                        onClick={() => deleteSavedSearch(savedSearch.id)}
                                    >
                                        <XIcon className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Save Current Search */}
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Save current search..."
                        value={saveSearchName}
                        onChange={(e) => setSaveSearchName(e.target.value)}
                        className="flex-1"
                    />
                    <Button
                        variant="outline"
                        onClick={saveCurrentSearch}
                        disabled={!saveSearchName.trim()}
                    >
                        <BookmarkIcon className="w-4 h-4 mr-1" />
                        Save
                    </Button>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={performSearch}
                            disabled={isSearchLoading}
                            className="min-w-[120px]"
                        >
                            <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                            {isSearchLoading ? 'Searching...' : 'Search'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={clearFilters}
                            disabled={isSearchLoading}
                        >
                            <XIcon className="w-4 h-4 mr-2" />
                            Clear All
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Select
                            value={filters.sort_by || 'created_at'}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, sort_by: value }))}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="created_at">Registration Date</SelectItem>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="date_of_birth">Date of Birth</SelectItem>
                                <SelectItem value="patient_id">Patient ID</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.sort_order || 'desc'}
                            onValueChange={(value: 'asc' | 'desc') => setFilters(prev => ({ ...prev, sort_order: value }))}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="desc">Newest First</SelectItem>
                                <SelectItem value="asc">Oldest First</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
