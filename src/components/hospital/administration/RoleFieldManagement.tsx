import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus, Edit, MoveUp, MoveDown } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useNotifications } from '@/hooks/useNotifications'

interface RoleField {
    id: string
    fieldName: string
    fieldLabel: string
    fieldType: string
    fieldOptions: Record<string, any>
    isRequired: boolean
    sortOrder: number
    isActive: boolean
    description: string | null
    validationRules: Record<string, any>
}

interface FieldOption {
    value: string
    label: string
}

const FIELD_TYPES = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'number', label: 'Number' },
    { value: 'decimal', label: 'Decimal' },
    { value: 'boolean', label: 'Yes/No' },
    { value: 'date', label: 'Date' },
    { value: 'datetime', label: 'Date & Time' },
    { value: 'select', label: 'Dropdown' },
    { value: 'multi_select', label: 'Multiple Choice' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'phone', label: 'Phone Number' },
    { value: 'url', label: 'Website URL' }
]

interface RoleFieldManagementProps {
    roleId: string
    roleName: string
}

export function RoleFieldManagement({ roleId, roleName }: RoleFieldManagementProps) {
    const [fields, setFields] = useState<RoleField[]>([])
    const [loading, setLoading] = useState(true)
    const [editingField, setEditingField] = useState<RoleField | null>(null)
    const [showFieldDialog, setShowFieldDialog] = useState(false)
    const { addNotification } = useNotifications()

    useEffect(() => {
        fetchRoleFields()
    }, [roleId])

    const fetchRoleFields = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/role-fields/role/${roleId}/fields`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch role fields')
            }

            const result = await response.json()
            setFields(result.data || [])
        } catch (error) {
            console.error('Error fetching role fields:', error)
            addNotification({
                message: 'Failed to load role fields',
                type: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    const createDoctorTemplate = async () => {
        try {
            const response = await fetch(`/api/role-fields/role/${roleId}/fields/doctor-template`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to create doctor template')
            }

            await fetchRoleFields()
            addNotification({
                message: 'Doctor template fields created successfully',
                type: 'success'
            })
        } catch (error) {
            console.error('Error creating doctor template:', error)
            addNotification({
                message: 'Failed to create doctor template',
                type: 'error'
            })
        }
    }

    const deleteField = async (fieldId: string) => {
        try {
            const response = await fetch(`/api/role-fields/field/${fieldId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to delete field')
            }

            await fetchRoleFields()
            addNotification({
                message: 'Field deleted successfully',
                type: 'success'
            })
        } catch (error) {
            console.error('Error deleting field:', error)
            addNotification({
                message: 'Failed to delete field',
                type: 'error'
            })
        }
    }

    const updateFieldOrder = async (fieldId: string, newSortOrder: number) => {
        try {
            const response = await fetch(`/api/role-fields/field/${fieldId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ sortOrder: newSortOrder })
            })

            if (!response.ok) {
                throw new Error('Failed to update field order')
            }

            await fetchRoleFields()
        } catch (error) {
            console.error('Error updating field order:', error)
            addNotification({
                message: 'Failed to update field order',
                type: 'error'
            })
        }
    }

    const moveField = (fieldId: string, direction: 'up' | 'down') => {
        const currentIndex = fields.findIndex(f => f.id === fieldId)
        const currentField = fields[currentIndex]

        if (direction === 'up' && currentIndex > 0) {
            updateFieldOrder(fieldId, currentField.sortOrder - 1)
        } else if (direction === 'down' && currentIndex < fields.length - 1) {
            updateFieldOrder(fieldId, currentField.sortOrder + 1)
        }
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Role Fields - {roleName}</CardTitle>
                    <div className="flex space-x-2">
                        {fields.length === 0 && roleName.toLowerCase().includes('doctor') && (
                            <Button onClick={createDoctorTemplate} variant="outline" size="sm">
                                Create Doctor Template
                            </Button>
                        )}
                        <Dialog open={showFieldDialog} onOpenChange={setShowFieldDialog}>
                            <DialogTrigger asChild>
                                <Button size="sm" onClick={() => setEditingField(null)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Field
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingField ? 'Edit Field' : 'Add New Field'}
                                    </DialogTitle>
                                </DialogHeader>
                                <FieldEditor
                                    roleId={roleId}
                                    field={editingField}
                                    onSave={() => {
                                        setShowFieldDialog(false)
                                        setEditingField(null)
                                        fetchRoleFields()
                                    }}
                                    onCancel={() => {
                                        setShowFieldDialog(false)
                                        setEditingField(null)
                                    }}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {fields.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No fields defined for this role</p>
                        <p className="text-sm text-gray-400 mt-2">Add fields to collect role-specific information</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {fields
                            .sort((a, b) => a.sortOrder - b.sortOrder)
                            .map((field, index) => (
                                <div key={field.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <h4 className="font-medium">{field.fieldLabel}</h4>
                                            <Badge variant={field.isRequired ? 'default' : 'secondary'}>
                                                {field.isRequired ? 'Required' : 'Optional'}
                                            </Badge>
                                            <Badge variant="outline">
                                                {FIELD_TYPES.find(t => t.value === field.fieldType)?.label || field.fieldType}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Field name: <code className="bg-gray-100 px-1 rounded">{field.fieldName}</code>
                                        </p>
                                        {field.description && (
                                            <p className="text-sm text-gray-500 mt-1">{field.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => moveField(field.id, 'up')}
                                            disabled={index === 0}
                                        >
                                            <MoveUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => moveField(field.id, 'down')}
                                            disabled={index === fields.length - 1}
                                        >
                                            <MoveDown className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingField(field)
                                                setShowFieldDialog(true)
                                            }}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="outline">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Field</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete "{field.fieldLabel}"? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => deleteField(field.id)}>
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

interface FieldEditorProps {
    roleId: string
    field: RoleField | null
    onSave: () => void
    onCancel: () => void
}

function FieldEditor({ roleId, field, onSave, onCancel }: FieldEditorProps) {
    const [formData, setFormData] = useState({
        fieldName: field?.fieldName || '',
        fieldLabel: field?.fieldLabel || '',
        fieldType: field?.fieldType || 'text',
        isRequired: field?.isRequired || false,
        description: field?.description || '',
        sortOrder: field?.sortOrder || 0,
        options: field?.fieldOptions?.options || [],
        validationRules: field?.validationRules || {}
    })
    const [saving, setSaving] = useState(false)
    const { addNotification } = useNotifications()

    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, { value: '', label: '' }]
        }))
    }

    const updateOption = (index: number, field: 'value' | 'label', value: string) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.map((opt: FieldOption, i: number) =>
                i === index ? { ...opt, [field]: value } : opt
            )
        }))
    }

    const removeOption = (index: number) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.filter((_: any, i: number) => i !== index)
        }))
    }

    const handleSave = async () => {
        try {
            setSaving(true)

            const payload = {
                fieldName: formData.fieldName,
                fieldLabel: formData.fieldLabel,
                fieldType: formData.fieldType,
                isRequired: formData.isRequired,
                description: formData.description,
                sortOrder: formData.sortOrder,
                fieldOptions: {
                    options: formData.options.filter((opt: FieldOption) => opt.value && opt.label)
                },
                validationRules: formData.validationRules
            }

            const url = field
                ? `/api/role-fields/field/${field.id}`
                : `/api/role-fields/role/${roleId}/fields`

            const response = await fetch(url, {
                method: field ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                throw new Error('Failed to save field')
            }

            addNotification({
                message: `Field ${field ? 'updated' : 'created'} successfully`,
                type: 'success'
            })

            onSave()
        } catch (error) {
            console.error('Error saving field:', error)
            addNotification({
                message: 'Failed to save field',
                type: 'error'
            })
        } finally {
            setSaving(false)
        }
    }

    const needsOptions = formData.fieldType === 'select' || formData.fieldType === 'multi_select'

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Field Name</Label>
                    <Input
                        value={formData.fieldName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fieldName: e.target.value }))}
                        placeholder="e.g. doctorId"
                    />
                    <p className="text-xs text-gray-500">Used internally (no spaces, camelCase)</p>
                </div>
                <div className="space-y-2">
                    <Label>Field Label</Label>
                    <Input
                        value={formData.fieldLabel}
                        onChange={(e) => setFormData(prev => ({ ...prev, fieldLabel: e.target.value }))}
                        placeholder="e.g. Doctor ID"
                    />
                    <p className="text-xs text-gray-500">Displayed to users</p>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Field Type</Label>
                <Select
                    value={formData.fieldType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, fieldType: value }))}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {FIELD_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                                {type.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Help text shown to users"
                    rows={2}
                />
            </div>

            <div className="flex items-center space-x-2">
                <Switch
                    checked={formData.isRequired}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRequired: checked }))}
                />
                <Label>Required Field</Label>
            </div>

            {needsOptions && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>Options</Label>
                        <Button size="sm" variant="outline" onClick={addOption}>
                            <Plus className="h-4 w-4 mr-1" />
                            Add Option
                        </Button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {formData.options.map((option: FieldOption, index: number) => (
                            <div key={index} className="flex space-x-2">
                                <Input
                                    value={option.value}
                                    onChange={(e) => updateOption(index, 'value', e.target.value)}
                                    placeholder="Value"
                                    className="flex-1"
                                />
                                <Input
                                    value={option.label}
                                    onChange={(e) => updateOption(index, 'label', e.target.value)}
                                    placeholder="Label"
                                    className="flex-1"
                                />
                                <Button size="sm" variant="outline" onClick={() => removeOption(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                </Button>
            </div>
        </div>
    )
}
