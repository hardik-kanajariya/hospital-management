import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
    TrashIcon,
    DatabaseIcon,
    TagIcon,
    CheckCircleIcon,
    XCircleIcon,
    DownloadIcon,
    UploadIcon,
    PlantIcon,
    ListIcon
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useMasterDataApi } from '@/hooks/useMasterDataApi'

interface MasterDataItem {
    id: string
    name: string
    code: string
    description?: string
    category: string
    isActive: boolean
    isSystemGenerated: boolean
    sortOrder: number
    metadata?: Record<string, any>
    created_at: string
    updated_at: string
}

interface MasterDataFormData {
    name: string
    code: string
    description: string
    category: string
    isActive: boolean
    sortOrder: number
    metadata: Record<string, any>
}

// Master Data Categories - defines what types of master data we manage
const MASTER_DATA_CATEGORIES = [
    {
        key: 'departments',
        label: 'Departments',
        description: 'Hospital departments and units',
        icon: DatabaseIcon
    },
    {
        key: 'specializations',
        label: 'Medical Specializations',
        description: 'Doctor specializations and medical fields',
        icon: TagIcon
    },
    {
        key: 'lab_test_categories',
        label: 'Lab Test Categories',
        description: 'Laboratory test categories and types',
        icon: ListIcon
    },
    {
        key: 'lab_test_types',
        label: 'Lab Test Types',
        description: 'Specific laboratory test types',
        icon: ListIcon
    },
    {
        key: 'appointment_types',
        label: 'Appointment Types',
        description: 'Types of medical appointments',
        icon: TagIcon
    },
    {
        key: 'room_types',
        label: 'Room Types',
        description: 'Hospital room and facility types',
        icon: DatabaseIcon
    },
    {
        key: 'bed_types',
        label: 'Bed Types',
        description: 'Types of beds and their classifications',
        icon: TagIcon
    },
    {
        key: 'insurance_providers',
        label: 'Insurance Providers',
        description: 'Health insurance companies and providers',
        icon: DatabaseIcon
    },
    {
        key: 'medication_categories',
        label: 'Medication Categories',
        description: 'Drug and medication categories',
        icon: TagIcon
    },
    {
        key: 'discharge_types',
        label: 'Discharge Types',
        description: 'Patient discharge classifications',
        icon: ListIcon
    }
]

export default function MastersManagement() {
    const {
        masterData,
        loading,
        fetchMasterData,
        createMasterDataItem,
        updateMasterDataItem,
        toggleMasterDataStatus
    } = useMasterDataApi()

    const [selectedCategory, setSelectedCategory] = useState<string>('departments')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<MasterDataItem | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const [formData, setFormData] = useState<MasterDataFormData>({
        name: '',
        code: '',
        description: '',
        category: 'departments',
        isActive: true,
        sortOrder: 0,
        metadata: {}
    })

    useEffect(() => {
        fetchMasterData({ category: selectedCategory })
    }, [selectedCategory, fetchMasterData])

    useEffect(() => {
        setFormData(prev => ({ ...prev, category: selectedCategory }))
    }, [selectedCategory])

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category)
        setSearchTerm('')
    }

    const handleAddItem = async () => {
        if (!formData.name.trim() || !formData.code.trim()) {
            toast.error('Name and code are required')
            return
        }

        try {
            await createMasterDataItem({
                name: formData.name.trim(),
                code: formData.code.trim().toUpperCase(),
                description: formData.description.trim(),
                category: formData.category,
                isActive: formData.isActive,
                sortOrder: formData.sortOrder
            })

            setFormData({
                name: '',
                code: '',
                description: '',
                category: selectedCategory,
                isActive: true,
                sortOrder: 0,
                metadata: {}
            })
            setIsDialogOpen(false)
            toast.success('Master data item created successfully')
        } catch (error) {
            console.error('Failed to create master data item:', error)
        }
    }

    const handleEditItem = async () => {
        if (!editingItem || !formData.name.trim() || !formData.code.trim()) {
            toast.error('Name and code are required')
            return
        }

        try {
            await updateMasterDataItem(editingItem.id, {
                name: formData.name.trim(),
                code: formData.code.trim().toUpperCase(),
                description: formData.description.trim(),
                isActive: formData.isActive,
                sortOrder: formData.sortOrder
            })

            setEditingItem(null)
            setFormData({
                name: '',
                code: '',
                description: '',
                category: selectedCategory,
                isActive: true,
                sortOrder: 0,
                metadata: {}
            })
            setIsDialogOpen(false)
            toast.success('Master data item updated successfully')
        } catch (error) {
            console.error('Failed to update master data item:', error)
        }
    }

    const handleToggleStatus = async (item: MasterDataItem) => {
        if (item.isSystemGenerated) {
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
        if (item.isSystemGenerated) {
            toast.error('System generated items cannot be edited')
            return
        }

        setEditingItem(item)
        setFormData({
            name: item.name,
            code: item.code,
            description: item.description || '',
            category: item.category,
            isActive: item.isActive,
            sortOrder: item.sortOrder,
            metadata: item.metadata || {}
        })
        setIsDialogOpen(true)
    }

    const openAddDialog = () => {
        setEditingItem(null)
        setFormData({
            name: '',
            code: '',
            description: '',
            category: selectedCategory,
            isActive: true,
            sortOrder: 0,
            metadata: {}
        })
        setIsDialogOpen(true)
    }

    const filteredData = masterData.filter(item =>
        item.category === selectedCategory &&
        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.code.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const activeCategory = MASTER_DATA_CATEGORIES.find(cat => cat.key === selectedCategory)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Masters Data Management</h3>
                    <p className="text-muted-foreground">Configure dropdown values and system settings</p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" className="flex items-center gap-2">
                        <DownloadIcon className="h-4 w-4" />
                        Export
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                        <UploadIcon className="h-4 w-4" />
                        Import
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                        <PlantIcon className="h-4 w-4" />
                        Seed Data
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
                        <div className="text-2xl font-bold">{MASTER_DATA_CATEGORIES.length}</div>
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
                            {masterData.filter(item => item.isActive).length}
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
                            {masterData.filter(item => item.isSystemGenerated).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Categories Sidebar */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base">Categories</CardTitle>
                        <CardDescription>Select a category to manage</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {MASTER_DATA_CATEGORIES.map((category) => {
                            const Icon = category.icon
                            const categoryCount = masterData.filter(item => item.category === category.key).length

                            return (
                                <Button
                                    key={category.key}
                                    variant={selectedCategory === category.key ? "default" : "ghost"}
                                    className="w-full justify-start h-auto p-3"
                                    onClick={() => handleCategoryChange(category.key)}
                                >
                                    <div className="flex items-center gap-3 w-full">
                                        <Icon className="h-4 w-4 flex-shrink-0" />
                                        <div className="flex-1 text-left">
                                            <div className="font-medium text-sm">{category.label}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {categoryCount} items
                                            </div>
                                        </div>
                                    </div>
                                </Button>
                            )
                        })}
                    </CardContent>
                </Card>

                {/* Main Content */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    {activeCategory && <activeCategory.icon className="h-5 w-5" />}
                                    {activeCategory?.label}
                                </CardTitle>
                                <CardDescription>{activeCategory?.description}</CardDescription>
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
                                        <TableHead>Code</TableHead>
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
                                                <Badge variant="outline">{item.code}</Badge>
                                            </TableCell>
                                            <TableCell>{item.description || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant={item.isActive ? "default" : "secondary"}>
                                                    {item.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={item.isSystemGenerated ? "destructive" : "outline"}>
                                                    {item.isSystemGenerated ? 'System' : 'Custom'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{item.sortOrder}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditDialog(item)}
                                                        disabled={item.isSystemGenerated}
                                                    >
                                                        <PencilSimpleIcon className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggleStatus(item)}
                                                        disabled={item.isSystemGenerated}
                                                    >
                                                        {item.isActive ? (
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
                            <Label htmlFor="code">Code *</Label>
                            <Input
                                id="code"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                placeholder="Enter code (uppercase)"
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
                                <Label htmlFor="sortOrder">Sort Order</Label>
                                <Input
                                    id="sortOrder"
                                    type="number"
                                    value={formData.sortOrder}
                                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="isActive">Status</Label>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Switch
                                        id="isActive"
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                    />
                                    <Label htmlFor="isActive" className="text-sm">
                                        {formData.isActive ? 'Active' : 'Inactive'}
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
        </div>
    )
}
