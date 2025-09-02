import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Role, Permission, RolePermission } from '@/types/auth';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    UsersIcon,
    ShieldIcon,
    GearIcon,
    CopyIcon,
    CheckIcon,
    XIcon,
    DotsThreeVerticalIcon,
    ArchiveIcon,
    ArchiveBoxIcon
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface RoleTemplate {
    id: string;
    name: string;
    displayName: string;
    description: string;
    accessLevel: number;
    permissions: string[];
}

interface RoleFormData {
    name: string;
    displayName: string;
    description: string;
    accessLevel: number;
    isActive: boolean;
    permissions: RolePermission[];
}

export default function RoleManagement() {
    const navigate = useNavigate();
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [roleTemplates, setRoleTemplates] = useState<RoleTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
    const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [bulkOperation, setBulkOperation] = useState<'delete' | 'activate' | 'deactivate' | ''>('');

    const [formData, setFormData] = useState<RoleFormData>({
        name: '',
        displayName: '',
        description: '',
        accessLevel: 1,
        isActive: true,
        permissions: []
    });

    const [filters, setFilters] = useState({
        search: '',
        status: 'all', // all, active, inactive
        accessLevel: 'all' // all, high, medium, low
    });

    const availableActions = ['create', 'read', 'update', 'delete'] as const;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await Promise.all([
            loadRoles(),
            loadPermissions(),
            loadRoleTemplates()
        ]);
        setLoading(false);
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

    const loadPermissions = async () => {
        try {
            const response = await httpService.get('/roles/permissions');
            if (response.success) {
                setPermissions(response.data);
            }
        } catch (error) {
            toast.error('Failed to load permissions');
        }
    };

    const loadRoleTemplates = async () => {
        try {
            const response = await httpService.get('/roles/templates');
            if (response.success) {
                setRoleTemplates(response.data);
            }
        } catch (error) {
            console.error('Failed to load role templates');
        }
    };

    const handleCreateRole = () => {
        setEditingRole(null);
        setFormData({
            name: '',
            displayName: '',
            description: '',
            accessLevel: 1,
            isActive: true,
            permissions: []
        });
        setDialogOpen(true);
    };

    const handleCreateFromTemplate = async () => {
        if (!selectedTemplate) {
            toast.error('Please select a template');
            return;
        }

        try {
            const response = await httpService.post('/roles/from-template', {
                templateId: selectedTemplate
            });

            if (response.success) {
                toast.success('Role created from template successfully');
                setTemplateDialogOpen(false);
                setSelectedTemplate('');
                loadRoles();
            }
        } catch (error) {
            toast.error('Failed to create role from template');
        }
    };

    const handleEditRole = (role: Role) => {
        setEditingRole(role);
        setFormData({
            name: role.name,
            displayName: role.displayName,
            description: role.description || '',
            accessLevel: role.accessLevel,
            isActive: role.isActive,
            permissions: role.permissions?.map(p => ({
                roleId: role.id,
                permissionId: p.id,
                actions: p.actions || []
            })) || []
        });
        setDialogOpen(true);
    };

    const handleDeleteRole = async (role: Role) => {
        if (role.isSystemRole) {
            toast.error('System roles cannot be deleted');
            return;
        }

        if (role.userCount && role.userCount > 0) {
            toast.error('Cannot delete role with assigned users');
            return;
        }

        if (confirm(`Are you sure you want to delete the role "${role.displayName}"?`)) {
            try {
                const response = await httpService.delete(`/roles/${role.id}`);
                if (response.success) {
                    toast.success('Role deleted successfully');
                    loadRoles();
                }
            } catch (error) {
                toast.error('Failed to delete role');
            }
        }
    };

    const handleBulkOperation = async () => {
        if (selectedRoles.length === 0) {
            toast.error('Please select roles to perform bulk operation');
            return;
        }

        if (!bulkOperation) {
            toast.error('Please select an operation');
            return;
        }

        try {
            const response = await httpService.post('/roles/bulk-operation', {
                operation: bulkOperation,
                roleIds: selectedRoles
            });

            if (response.success) {
                toast.success(`Bulk ${bulkOperation} completed successfully`);
                setBulkDialogOpen(false);
                setSelectedRoles([]);
                setBulkOperation('');
                loadRoles();
            }
        } catch (error) {
            toast.error(`Failed to perform bulk ${bulkOperation}`);
        }
    };

    const handleRoleSelection = (roleId: string, checked: boolean) => {
        if (checked) {
            setSelectedRoles([...selectedRoles, roleId]);
        } else {
            setSelectedRoles(selectedRoles.filter(id => id !== roleId));
        }
    };

    const handleSelectAllRoles = (checked: boolean) => {
        if (checked) {
            setSelectedRoles(filteredRoles.map(role => role.id));
        } else {
            setSelectedRoles([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload = {
                ...formData,
                permissions: formData.permissions.map(p => ({
                    permissionId: p.permissionId,
                    actions: p.actions
                }))
            };

            let response;
            if (editingRole) {
                response = await httpService.put(`/roles/${editingRole.id}`, payload);
            } else {
                response = await httpService.post('/roles', payload);
            }

            if (response.success) {
                toast.success(`Role ${editingRole ? 'updated' : 'created'} successfully`);
                setDialogOpen(false);
                loadRoles();
            }
        } catch (error) {
            toast.error(`Failed to ${editingRole ? 'update' : 'create'} role`);
        }
    };

    const handlePermissionChange = (permissionId: string, actions: string[]) => {
        setFormData(prev => ({
            ...prev,
            permissions: [
                ...prev.permissions.filter(p => p.permissionId !== permissionId),
                ...(actions.length > 0 ? [{
                    roleId: editingRole?.id || '',
                    permissionId,
                    actions
                }] : [])
            ]
        }));
    };

    const getAccessLevelColor = (level: number) => {
        if (level >= 80) return 'bg-red-100 text-red-800';
        if (level >= 60) return 'bg-orange-100 text-orange-800';
        if (level >= 40) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    };

    const getAccessLevelText = (level: number) => {
        if (level >= 80) return 'Critical';
        if (level >= 60) return 'High';
        if (level >= 40) return 'Medium';
        return 'Low';
    };

    // Filter roles based on search and filters
    const filteredRoles = roles.filter(role => {
        const matchesSearch = role.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            role.displayName.toLowerCase().includes(filters.search.toLowerCase());

        const matchesStatus = filters.status === 'all' ||
            (filters.status === 'active' && role.isActive) ||
            (filters.status === 'inactive' && !role.isActive);

        const matchesAccessLevel = filters.accessLevel === 'all' ||
            (filters.accessLevel === 'high' && role.accessLevel >= 80) ||
            (filters.accessLevel === 'medium' && role.accessLevel >= 40 && role.accessLevel < 80) ||
            (filters.accessLevel === 'low' && role.accessLevel < 40);

        return matchesSearch && matchesStatus && matchesAccessLevel;
    });

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
                    <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
                    <p className="text-muted-foreground">
                        Manage roles, permissions, and access levels across your organization
                    </p>
                </div>
                <div className="flex gap-2">
                    {selectedRoles.length > 0 && (
                        <Button
                            variant="outline"
                            onClick={() => setBulkDialogOpen(true)}
                            className="flex items-center gap-2"
                        >
                            <GearIcon className="h-4 w-4" />
                            Bulk Actions ({selectedRoles.length})
                        </Button>
                    )}
                    <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                                <CopyIcon className="h-4 w-4" />
                                From Template
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Role from Template</DialogTitle>
                                <DialogDescription>
                                    Choose a pre-defined role template to quickly create a new role
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="template">Role Template</Label>
                                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roleTemplates.map(template => (
                                                <SelectItem key={template.id} value={template.id}>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{template.displayName}</span>
                                                        <span className="text-sm text-muted-foreground">{template.description}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreateFromTemplate}>
                                        Create Role
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Button onClick={handleCreateRole} className="flex items-center gap-2">
                        <PlusIcon className="h-4 w-4" />
                        Create Role
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-64">
                            <Input
                                placeholder="Search roles..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>
                        <Select
                            value={filters.status}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.accessLevel}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, accessLevel: value }))}
                        >
                            <SelectTrigger className="w-36">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Levels</SelectItem>
                                <SelectItem value="high">High (80+)</SelectItem>
                                <SelectItem value="medium">Medium (40-79)</SelectItem>
                                <SelectItem value="low">Low (&lt;40)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Roles Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Roles ({filteredRoles.length})</CardTitle>
                    <CardDescription>
                        Manage user roles and their associated permissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={selectedRoles.length === filteredRoles.length && filteredRoles.length > 0}
                                        onCheckedChange={handleSelectAllRoles}
                                    />
                                </TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Access Level</TableHead>
                                <TableHead>Users</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRoles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedRoles.includes(role.id)}
                                            onCheckedChange={(checked) => handleRoleSelection(role.id, checked as boolean)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="font-medium">{role.displayName}</div>
                                            <div className="text-sm text-muted-foreground">{role.description}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getAccessLevelColor(role.accessLevel)}>
                                            {getAccessLevelText(role.accessLevel)} ({role.accessLevel})
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <UsersIcon className="h-4 w-4 text-muted-foreground" />
                                            {role.userCount || 0}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={role.isActive ? 'default' : 'secondary'}>
                                            {role.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={role.isSystemRole ? 'destructive' : 'outline'}>
                                            {role.isSystemRole ? 'System' : 'Custom'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditRole(role)}
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </Button>
                                            {!role.isSystemRole && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteRole(role)}
                                                    disabled={role.userCount > 0}
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Role Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingRole ? 'Edit Role' : 'Create New Role'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingRole ? 'Modify role details and permissions' : 'Create a new role with specific permissions'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Role Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., doctor"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="displayName">Display Name</Label>
                                <Input
                                    id="displayName"
                                    value={formData.displayName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                                    placeholder="e.g., Doctor"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Brief description of this role"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="accessLevel">Access Level (1-100)</Label>
                                <Input
                                    id="accessLevel"
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={formData.accessLevel}
                                    onChange={(e) => setFormData(prev => ({ ...prev, accessLevel: parseInt(e.target.value) || 1 }))}
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

                        {/* Permissions */}
                        <div>
                            <Label>Permissions</Label>
                            <div className="space-y-4 max-h-64 overflow-y-auto border rounded p-4">
                                {permissions.map((permission) => {
                                    const rolePermission = formData.permissions.find(p => p.permissionId === permission.id);
                                    const selectedActions = rolePermission?.actions || [];

                                    return (
                                        <div key={permission.id} className="space-y-2">
                                            <div className="font-medium">{permission.name}</div>
                                            <div className="flex gap-2">
                                                {availableActions.map((action) => (
                                                    <label key={action} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            checked={selectedActions.includes(action)}
                                                            onCheckedChange={(checked) => {
                                                                const newActions = checked
                                                                    ? [...selectedActions, action]
                                                                    : selectedActions.filter(a => a !== action);
                                                                handlePermissionChange(permission.id, newActions);
                                                            }}
                                                        />
                                                        <span className="text-sm capitalize">{action}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingRole ? 'Update Role' : 'Create Role'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Bulk Operations Dialog */}
            <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bulk Operations</DialogTitle>
                        <DialogDescription>
                            Perform bulk operations on {selectedRoles.length} selected roles
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="operation">Operation</Label>
                            <Select value={bulkOperation} onValueChange={(value: any) => setBulkOperation(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select operation" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="activate">Activate Roles</SelectItem>
                                    <SelectItem value="deactivate">Deactivate Roles</SelectItem>
                                    <SelectItem value="delete">Delete Roles</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleBulkOperation} variant={bulkOperation === 'delete' ? 'destructive' : 'default'}>
                                Apply Operation
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
