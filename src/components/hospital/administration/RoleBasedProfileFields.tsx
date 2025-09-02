import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { httpService } from '@/services/HttpService';
import { Role } from '@/types/auth';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    ListIcon,
    CalendarIcon,
    ToggleLeftIcon,
    TextTIcon,
    HashIcon,
    EnvelopeIcon,
    PhoneIcon
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface ProfileField {
    id: string;
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'checkbox' | 'radio';
    required: boolean;
    defaultValue?: string;
    options?: string[];
    validationRules?: {
        minLength?: number;
        maxLength?: number;
        pattern?: string;
        min?: number;
        max?: number;
    };
    helpText?: string;
    isActive: boolean;
    order: number;
}

interface RoleFieldMapping {
    id: string;
    roleId: string;
    fieldId: string;
    isVisible: boolean;
    isEditable: boolean;
    isRequired: boolean;
    conditionalLogic?: {
        dependsOn: string;
        condition: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
        value: string;
    };
}

interface FormData {
    name: string;
    label: string;
    type: ProfileField['type'];
    required: boolean;
    defaultValue: string;
    options: string[];
    validationRules: ProfileField['validationRules'];
    helpText: string;
    isActive: boolean;
}

export default function RoleBasedProfileFields() {
    const [fields, setFields] = useState<ProfileField[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [roleMappings, setRoleMappings] = useState<RoleFieldMapping[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [mappingDialogOpen, setMappingDialogOpen] = useState(false);
    const [editingField, setEditingField] = useState<ProfileField | null>(null);
    const [selectedFieldForMapping, setSelectedFieldForMapping] = useState<string>('');

    const [formData, setFormData] = useState<FormData>({
        name: '',
        label: '',
        type: 'text',
        required: false,
        defaultValue: '',
        options: [],
        validationRules: {},
        helpText: '',
        isActive: true
    });

    const [optionInput, setOptionInput] = useState('');

    const fieldTypes = [
        { value: 'text', label: 'Text Input', icon: TextTIcon },
        { value: 'textarea', label: 'Text Area', icon: TextTIcon },
        { value: 'number', label: 'Number', icon: HashIcon },
        { value: 'email', label: 'Email', icon: EnvelopeIcon },
        { value: 'phone', label: 'Phone', icon: PhoneIcon },
        { value: 'date', label: 'Date', icon: CalendarIcon },
        { value: 'select', label: 'Dropdown', icon: ListIcon },
        { value: 'checkbox', label: 'Checkbox', icon: ToggleLeftIcon },
        { value: 'radio', label: 'Radio Buttons', icon: ToggleLeftIcon }
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await Promise.all([
            loadFields(),
            loadRoles(),
            loadRoleMappings()
        ]);
        setLoading(false);
    };

    const loadFields = async () => {
        try {
            // Mock API call - replace with actual endpoint
            const response = await httpService.get('/profile-fields');
            if (response.success) {
                setFields(response.data);
            }
        } catch (error) {
            // Mock data for demonstration
            setFields([
                {
                    id: '1',
                    name: 'emergency_contact',
                    label: 'Emergency Contact',
                    type: 'text',
                    required: true,
                    isActive: true,
                    order: 1
                },
                {
                    id: '2',
                    name: 'specialization',
                    label: 'Medical Specialization',
                    type: 'select',
                    required: true,
                    options: ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics'],
                    isActive: true,
                    order: 2
                },
                {
                    id: '3',
                    name: 'license_number',
                    label: 'Medical License Number',
                    type: 'text',
                    required: true,
                    isActive: true,
                    order: 3
                }
            ]);
        }
    };

    const loadRoles = async () => {
        try {
            const response = await httpService.get('/roles');
            if (response.success) {
                setRoles(response.data);
            }
        } catch (error) {
            toast.error('Failed to load roles');
        }
    };

    const loadRoleMappings = async () => {
        try {
            // Mock API call - replace with actual endpoint
            const response = await httpService.get('/role-field-mappings');
            if (response.success) {
                setRoleMappings(response.data);
            }
        } catch (error) {
            // Mock data for demonstration
            setRoleMappings([
                {
                    id: '1',
                    roleId: 'doctor-role-id',
                    fieldId: '2',
                    isVisible: true,
                    isEditable: true,
                    isRequired: true
                },
                {
                    id: '2',
                    roleId: 'doctor-role-id',
                    fieldId: '3',
                    isVisible: true,
                    isEditable: true,
                    isRequired: true
                },
                {
                    id: '3',
                    roleId: 'nurse-role-id',
                    fieldId: '1',
                    isVisible: true,
                    isEditable: true,
                    isRequired: true
                }
            ]);
        }
    };

    const handleCreateField = () => {
        setEditingField(null);
        setFormData({
            name: '',
            label: '',
            type: 'text',
            required: false,
            defaultValue: '',
            options: [],
            validationRules: {},
            helpText: '',
            isActive: true
        });
        setDialogOpen(true);
    };

    const handleEditField = (field: ProfileField) => {
        setEditingField(field);
        setFormData({
            name: field.name,
            label: field.label,
            type: field.type,
            required: field.required,
            defaultValue: field.defaultValue || '',
            options: field.options || [],
            validationRules: field.validationRules || {},
            helpText: field.helpText || '',
            isActive: field.isActive
        });
        setDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload = {
                ...formData,
                order: editingField?.order || fields.length + 1
            };

            let response;
            if (editingField) {
                response = await httpService.put(`/profile-fields/${editingField.id}`, payload);
            } else {
                response = await httpService.post('/profile-fields', payload);
            }

            if (response.success) {
                toast.success(`Field ${editingField ? 'updated' : 'created'} successfully`);
                setDialogOpen(false);
                loadFields();
            }
        } catch (error) {
            toast.error(`Failed to ${editingField ? 'update' : 'create'} field`);
        }
    };

    const handleDeleteField = async (field: ProfileField) => {
        if (confirm(`Are you sure you want to delete the field "${field.label}"?`)) {
            try {
                const response = await httpService.delete(`/profile-fields/${field.id}`);
                if (response.success) {
                    toast.success('Field deleted successfully');
                    loadFields();
                }
            } catch (error) {
                toast.error('Failed to delete field');
            }
        }
    };

    const addOption = () => {
        if (optionInput.trim()) {
            setFormData(prev => ({
                ...prev,
                options: [...prev.options, optionInput.trim()]
            }));
            setOptionInput('');
        }
    };

    const removeOption = (index: number) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }));
    };

    const getRoleFieldMapping = (roleId: string, fieldId: string) => {
        return roleMappings.find(mapping => mapping.roleId === roleId && mapping.fieldId === fieldId);
    };

    const toggleFieldVisibility = async (roleId: string, fieldId: string) => {
        const mapping = getRoleFieldMapping(roleId, fieldId);

        try {
            if (mapping) {
                // Update existing mapping
                const response = await httpService.put(`/role-field-mappings/${mapping.id}`, {
                    ...mapping,
                    isVisible: !mapping.isVisible
                });
                if (response.success) {
                    loadRoleMappings();
                }
            } else {
                // Create new mapping
                const response = await httpService.post('/role-field-mappings', {
                    roleId,
                    fieldId,
                    isVisible: true,
                    isEditable: true,
                    isRequired: false
                });
                if (response.success) {
                    loadRoleMappings();
                }
            }
        } catch (error) {
            toast.error('Failed to update field mapping');
        }
    };

    const getFieldIcon = (type: ProfileField['type']) => {
        const fieldType = fieldTypes.find(ft => ft.value === type);
        return fieldType?.icon || TextTIcon;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Role-Based Profile Fields</h1>
                    <p className="text-muted-foreground">
                        Configure custom profile fields and their visibility per role
                    </p>
                </div>
                <Button onClick={handleCreateField} className="flex items-center gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Create Field
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Fields */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Fields ({fields.length})</CardTitle>
                        <CardDescription>
                            Manage custom profile fields for users
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {fields.map((field) => {
                                const FieldIcon = getFieldIcon(field.type);
                                return (
                                    <div key={field.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <FieldIcon className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">{field.label}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Type: {field.type} | Name: {field.name}
                                                </div>
                                                {field.required && (
                                                    <Badge variant="secondary" className="text-xs">Required</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={field.isActive}
                                                onCheckedChange={(checked) => {
                                                    // Handle field activation/deactivation
                                                }}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditField(field)}
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteField(field)}
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Role-Field Mapping */}
                <Card>
                    <CardHeader>
                        <CardTitle>Role-Field Mapping</CardTitle>
                        <CardDescription>
                            Configure which fields are visible for each role
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Field</TableHead>
                                    {roles.slice(0, 3).map(role => (
                                        <TableHead key={role.id} className="text-center">
                                            {role.displayName}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.map(field => (
                                    <TableRow key={field.id}>
                                        <TableCell className="font-medium">{field.label}</TableCell>
                                        {roles.slice(0, 3).map(role => {
                                            const mapping = getRoleFieldMapping(role.id, field.id);
                                            return (
                                                <TableCell key={role.id} className="text-center">
                                                    <Checkbox
                                                        checked={mapping?.isVisible || false}
                                                        onCheckedChange={() => toggleFieldVisibility(role.id, field.id)}
                                                    />
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Field Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingField ? 'Edit Profile Field' : 'Create Profile Field'}
                        </DialogTitle>
                        <DialogDescription>
                            Configure a custom profile field for users
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Field Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., emergency_contact"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="label">Display Label</Label>
                                <Input
                                    id="label"
                                    value={formData.label}
                                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                                    placeholder="e.g., Emergency Contact"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="type">Field Type</Label>
                            <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {fieldTypes.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {(formData.type === 'select' || formData.type === 'radio') && (
                            <div>
                                <Label>Options</Label>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Input
                                            value={optionInput}
                                            onChange={(e) => setOptionInput(e.target.value)}
                                            placeholder="Add option..."
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                                        />
                                        <Button type="button" onClick={addOption}>Add</Button>
                                    </div>
                                    <div className="space-y-1">
                                        {formData.options.map((option, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                                <span>{option}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeOption(index)}
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="helpText">Help Text</Label>
                            <Textarea
                                id="helpText"
                                value={formData.helpText}
                                onChange={(e) => setFormData(prev => ({ ...prev, helpText: e.target.value }))}
                                placeholder="Additional information for users"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="required">Required Field</Label>
                                <Switch
                                    id="required"
                                    checked={formData.required}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, required: checked }))}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="isActive">Active</Label>
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingField ? 'Update Field' : 'Create Field'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
