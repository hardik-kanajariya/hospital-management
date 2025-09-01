import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    GearIcon,
    PlusIcon,
    PencilSimpleIcon,
    DatabaseIcon,
    TagIcon,
    CheckCircleIcon,
    XCircleIcon,
    DownloadIcon,
    UploadIcon,
    ListIcon,
} from '@phosphor-icons/react';
import { toast } from 'sonner'
import { useMasterDataApi } from '@/hooks/useMasterDataApi'
import { httpService } from '@/services/HttpService'

interface MasterDataItem {
    id: string
    name: string
    description?: string
    category: string
    value?: string
    display_order: number
    is_system: boolean
    is_active: boolean
    metadata?: Record<string, any>
    created_at: string
    updated_at: string
}

interface MasterDataFormData {
    name: string
    description: string
    category: string
    value?: string
    is_active: boolean
    display_order: number
    metadata: Record<string, any>
}

interface CategoryInfo {
    name: string
    count: number
    is_system: boolean
}

// Master Data Categories - defines what types of master data we manage
// Remove this hardcoded array - we'll fetch categories dynamically

export default function MastersManagement() {
    const {
        masterData,
        loading,
        fetchMasterData,
        createMasterDataItem,
        updateMasterDataItem,
        toggleMasterDataStatus
    } = useMasterDataApi()

    const [categories, setCategories] = useState<CategoryInfo[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<MasterDataItem | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [isExporting, setIsExporting] = useState(false)
    const [isImporting, setIsImporting] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState<MasterDataFormData>({
        name: '',
        description: '',
        category: '',
        value: '',
        is_active: true,
        display_order: 0,
        metadata: {}
    })

    // Fetch all master data and extract unique categories
    useEffect(() => {
        const loadData = async () => {
            await fetchMasterData({}) // Fetch all data
        }
        loadData()
    }, [fetchMasterData])

    // Extract categories from master data
    useEffect(() => {
        const categoryMap = new Map<string, CategoryInfo>()

        masterData.forEach(item => {
            if (!categoryMap.has(item.category)) {
                categoryMap.set(item.category, {
                    name: item.category,
                    count: 0,
                    is_system: false
                })
            }
            const categoryInfo = categoryMap.get(item.category)!
            categoryInfo.count++
            // If any item in the category is system generated, mark the category as system
            if (item.is_system) {
                categoryInfo.is_system = true
            }
        })

        const sortedCategories = Array.from(categoryMap.values()).sort((a, b) => {
            // System categories first, then alphabetical
            if (a.is_system && !b.is_system) return -1
            if (!a.is_system && b.is_system) return 1
            return a.name.localeCompare(b.name)
        })

        setCategories(sortedCategories)

        // Set first category as selected if none selected
        if (!selectedCategory && sortedCategories.length > 0) {
            setSelectedCategory(sortedCategories[0].name)
        }
    }, [masterData, selectedCategory])

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category)
        setSearchTerm('')
        setFormData(prev => ({ ...prev, category }))
    }

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            toast.error('Category name is required')
            return
        }

        const categoryExists = categories.some(cat =>
            cat.name.toLowerCase() === newCategoryName.toLowerCase()
        )

        if (categoryExists) {
            toast.error('Category already exists')
            return
        }

        try {
            // Create a sample item in the new category to establish it
            await createMasterDataItem({
                name: `${newCategoryName} Sample`,
                description: `Sample item for ${newCategoryName} category`,
                category: newCategoryName.toLowerCase().replace(/\s+/g, '_'),
                value: 'sample',
                is_active: true,
                display_order: 0
            })

            setNewCategoryName('')
            setIsCategoryDialogOpen(false)
            toast.success('Category created successfully')

            // Refresh data to show new category
            await fetchMasterData({})
        } catch (error) {
            console.error('Failed to create category:', error)
            toast.error('Failed to create category')
        }
    }

    const handleAddItem = async () => {
        if (!formData.name.trim()) {
            toast.error('Name is required')
            return
        }

        try {
            await createMasterDataItem({
                name: formData.name.trim(),
                description: formData.description.trim(),
                category: formData.category,
                value: formData.value?.trim() || formData.name.toLowerCase().replace(/\s+/g, '_'),
                is_active: formData.is_active,
                display_order: formData.display_order
            })

            setFormData({
                name: '',
                description: '',
                category: selectedCategory,
                value: '',
                is_active: true,
                display_order: 0,
                metadata: {}
            })
            setIsDialogOpen(false)
            toast.success('Master data item created successfully')
        } catch (error) {
            console.error('Failed to create master data item:', error)
        }
    }

    const handleEditItem = async () => {
        if (!editingItem || !formData.name.trim()) {
            toast.error('Name is required')
            return
        }

        try {
            await updateMasterDataItem(editingItem.id, {
                name: formData.name.trim(),
                description: formData.description.trim(),
                value: formData.value?.trim() || formData.name.toLowerCase().replace(/\s+/g, '_'),
                is_active: formData.is_active,
                display_order: formData.display_order
            })

            setEditingItem(null)
            setFormData({
                name: '',
                description: '',
                category: selectedCategory,
                value: '',
                is_active: true,
                display_order: 0,
                metadata: {}
            })
            setIsDialogOpen(false)
            toast.success('Master data item updated successfully')
        } catch (error) {
            console.error('Failed to update master data item:', error)
        }
    }

    const handleToggleStatus = async (item: MasterDataItem) => {
        if (item.is_system) {
            toast.error('System generated items cannot be deleted, only disabled')
            return
        }

        try {
            await toggleMasterDataStatus(item.id)
        } catch (error) {
            console.error('Failed to toggle status:', error)
        }
    }

    const openEditDialog = (item: MasterDataItem) => {
        if (item.is_system) {
            toast.error('System generated items cannot be edited')
            return
        }

        setEditingItem(item)
        setFormData({
            name: item.name,
            description: item.description || '',
            category: item.category,
            value: item.value || '',
            is_active: item.is_active,
            display_order: item.display_order,
            metadata: item.metadata || {}
        })
        setIsDialogOpen(true)
    }

    const openAddDialog = () => {
        setEditingItem(null)
        setFormData({
            name: '',
            description: '',
            category: selectedCategory,
            value: '',
            is_active: true,
            display_order: 0,
            metadata: {}
        })
        setIsDialogOpen(true)
    }

    // Export functionality
    const handleExport = async () => {
        setIsExporting(true)
        try {
            // Build URL with query parameters
            let url = '/master-data'
            if (selectedCategory) {
                url += `?category=${selectedCategory}`
            }

            const response = await httpService.get(url)

            if (response.success) {
                const dataToExport = response.data

                // Convert to CSV format
                const csvContent = convertToCSV(dataToExport)

                // Create filename with category and date
                const categoryName = selectedCategory ? `_${selectedCategory}` : '_all'
                const filename = `master-data${categoryName}_${new Date().toISOString().split('T')[0]}.csv`

                // Create and download file
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                const link = document.createElement('a')
                const url = URL.createObjectURL(blob)
                link.setAttribute('href', url)
                link.setAttribute('download', filename)
                link.style.visibility = 'hidden'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)

                toast.success(`Master data exported successfully (${dataToExport.length} items)`)
            } else {
                toast.error('Failed to export master data')
            }
        } catch (error) {
            console.error('Export error:', error)
            toast.error('Failed to export master data')
        } finally {
            setIsExporting(false)
        }
    }

    // Import functionality
    const handleImport = () => {
        fileInputRef.current?.click()
    }

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]

        if (!file) return

        setIsImporting(true)
        try {
            const text = await file.text()
            let importData: any[]

            if (file.name.endsWith('.csv')) {
                importData = parseCSV(text)
            } else if (file.name.endsWith('.json')) {
                importData = JSON.parse(text)
            } else {
                toast.error('Only CSV and JSON files are supported')
                return
            }

            // Validate and import data
            await processImportData(importData)

        } catch (error) {
            console.error('Import error:', error)
            toast.error('Failed to import master data')
        } finally {
            setIsImporting(false)
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    // Helper function to convert data to CSV
    const convertToCSV = (data: MasterDataItem[]): string => {
        const headers = ['name', 'value', 'description', 'category', 'is_active', 'is_system', 'display_order']
        const csvRows = [
            headers.join(','),
            ...data.map(item =>
                headers.map(header => {
                    const value = item[header as keyof MasterDataItem]
                    return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
                }).join(',')
            )
        ]
        return csvRows.join('\n')
    }

    // Helper function to parse CSV
    const parseCSV = (text: string): any[] => {
        const lines = text.split('\n')
        const headers = lines[0].split(',').map(h => h.replace(/"/g, ''))

        return lines.slice(1)
            .filter(line => line.trim())
            .map(line => {
                const values = line.split(',').map(v => v.replace(/"/g, ''))
                const obj: any = {}
                headers.forEach((header, index) => {
                    let value: any = values[index]

                    // Convert boolean strings
                    if (value === 'true') value = true
                    else if (value === 'false') value = false
                    // Convert numbers
                    else if (header === 'sortOrder' && !isNaN(Number(value))) {
                        value = Number(value)
                    }

                    obj[header] = value
                })
                return obj
            })
    }

    // Process imported data
    const processImportData = async (data: any[]) => {
        let successCount = 0
        let errorCount = 0

        for (const item of data) {
            try {
                // Validate required fields
                if (!item.name || !item.category) {
                    errorCount++
                    continue
                }

                // Skip system generated items
                if (item.is_system) {
                    continue
                }

                await createMasterDataItem({
                    name: item.name,
                    description: item.description || '',
                    category: item.category,
                    value: item.value || item.name.toLowerCase().replace(/\s+/g, '_'),
                    is_active: item.is_active !== false,
                    display_order: item.display_order || 0
                })
                successCount++
            } catch (error) {
                errorCount++
                console.error('Import item error:', error)
            }
        }

        if (successCount > 0) {
            toast.success(`Successfully imported ${successCount} items`)
            await fetchMasterData({ category: selectedCategory })
        }

        if (errorCount > 0) {
            toast.error(`Failed to import ${errorCount} items`)
        }
    }

    const filteredData = masterData.filter(item =>
        item.category === selectedCategory &&
        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.value && item.value.toLowerCase().includes(searchTerm.toLowerCase())))
    )

    const selectedCategoryInfo = categories.find(cat => cat.name === selectedCategory)

    return (
        <div className="space-y-6">
            {/* Hidden file input for import */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Masters Data Management</h3>
                    <p className="text-muted-foreground">Configure dropdown values and system settings</p>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        <DownloadIcon className="h-4 w-4" />
                        {isExporting ? 'Exporting...' : 'Export'}
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={handleImport}
                        disabled={isImporting}
                    >
                        <UploadIcon className="h-4 w-4" />
                        {isImporting ? 'Importing...' : 'Import'}
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                        <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{categories.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <TagIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{masterData.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Items</CardTitle>
                        <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {masterData.filter(item => item.is_active).length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Generated</CardTitle>
                        <GearIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {masterData.filter(item => item.is_system).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Categories Sidebar */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base">Categories</CardTitle>
                                <CardDescription>Select a category to manage</CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsCategoryDialogOpen(true)}
                                title="Add New Category"
                            >
                                <PlusIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {categories.map((category) => (
                            <Button
                                key={category.name}
                                variant={selectedCategory === category.name ? "default" : "ghost"}
                                className="w-full justify-start h-auto p-3"
                                onClick={() => handleCategoryChange(category.name)}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <TagIcon className="h-4 w-4 flex-shrink-0" />
                                    <div className="flex-1 text-left">
                                        <div className="font-medium text-sm flex items-center gap-2">
                                            {category.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            {category.is_system && (
                                                <Badge variant="secondary" className="text-xs">System</Badge>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {category.count} items
                                        </div>
                                    </div>
                                </div>
                            </Button>
                        ))}
                    </CardContent>
                </Card>

                {/* Main Content */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <TagIcon className="h-5 w-5" />
                                    {selectedCategoryInfo?.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Master Data'}
                                    {selectedCategoryInfo?.is_system && (
                                        <Badge variant="secondary" className="text-xs">System</Badge>
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    Manage {selectedCategoryInfo?.name.replace(/_/g, ' ')} master data
                                </CardDescription>
                            </div>
                            <Button onClick={openAddDialog} className="flex items-center gap-2">
                                <PlusIcon className="h-4 w-4" />
                                Add Item
                            </Button>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search items..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                <p className="mt-2 text-muted-foreground">Loading...</p>
                            </div>
                        ) : filteredData.length === 0 ? (
                            <div className="text-center py-8">
                                <TagIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No items found</h3>
                                <p className="text-muted-foreground">
                                    {searchTerm ? 'No items match your search' : 'Start by adding your first item'}
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Value</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Sort Order</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredData.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{item.value || '-'}</Badge>
                                            </TableCell>
                                            <TableCell>{item.description || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant={item.is_active ? "default" : "secondary"}>
                                                    {item.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={item.is_system ? "destructive" : "outline"}>
                                                    {item.is_system ? 'System' : 'Custom'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{item.display_order}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditDialog(item)}
                                                        disabled={item.is_system}
                                                    >
                                                        <PencilSimpleIcon className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggleStatus(item)}
                                                        disabled={item.is_system}
                                                    >
                                                        {item.is_active ? (
                                                            <XCircleIcon className="h-4 w-4 text-red-500" />
                                                        ) : (
                                                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Edit Master Data Item' : 'Add Master Data Item'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingItem ? 'Update the master data item details' : 'Create a new master data item'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="value">Value</Label>
                            <Input
                                id="value"
                                value={formData.value || ''}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                placeholder="Enter value (auto-generated if empty)"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter description"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="display_order">Sort Order</Label>
                                <Input
                                    id="display_order"
                                    type="number"
                                    value={formData.display_order}
                                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="is_active">Status</Label>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Switch
                                        id="is_active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                    />
                                    <Label htmlFor="is_active" className="text-sm">
                                        {formData.is_active ? 'Active' : 'Inactive'}
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={editingItem ? handleEditItem : handleAddItem}>
                            {editingItem ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Category Dialog */}
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                        <DialogDescription>
                            Create a new master data category
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="categoryName">Category Name *</Label>
                            <Input
                                id="categoryName"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Enter category name"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateCategory}>
                            Create Category
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
