import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { PlusIcon, PencilIcon, TrashIcon, UsersIcon, ShieldIcon, GearIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { RoleFieldManagement } from './RoleFieldManagement';

interface RoleFormData {
    name: string;
    displayName: string;
    description: string;
    accessLevel: number;
    isActive: boolean;
    permissions: RolePermission[];
}

export default function RoleManagement() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState<RoleFormData>({
        name: '',
        displayName: '',
        description: '',
        accessLevel: 1,
        isActive: true,
        permissions: []
    });

    const availableActions = ['create', 'read', 'update', 'delete'] as const;

    useEffect(() => {
        loadRoles();
        loadPermissions();
    }, []);

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
            const response = await httpService.get('/permissions');
            if (response.success) {
                setPermissions(response.data);
            }
        } catch (error) {
            toast.error('Failed to load permissions');
        } finally {
            setLoading(false);
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
                    actions: actions as ('create' | 'read' | 'update' | 'delete')[]
                }] : [])
            ]
        }));
    };

    const getPermissionActions = (permissionId: string): string[] => {
        const permission = formData.permissions.find(p => p.permissionId === permissionId);
        return permission?.actions || [];
    };

    const groupedPermissions = permissions.reduce((acc, permission) => {
        if (!acc[permission.module]) {
            acc[permission.module] = [];
        }
        acc[permission.module].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center">Loading roles...</div>
                </CardContent>
            </Card>
        );
    }

    const [selectedRoleForFields, setSelectedRoleForFields] = useState<Role | null>(null)

    return (
        <div className="space-y-6">
            <Tabs defaultValue="roles" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="roles">Role Management</TabsTrigger>
                    <TabsTrigger value="fields">Role Fields</TabsTrigger>
                </TabsList>

                <TabsContent value="roles" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>System Roles</CardTitle>
                                    <CardDescription>
                                        Manage roles and their associated permissions
                                    </CardDescription>
                                </div>
                                <Button onClick={handleCreateRole}>
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Create Role
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Access Level</TableHead>
                                        <TableHead>Users</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roles.map((role) => (
                                        <TableRow key={role.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{role.displayName}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {role.description}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    Level {role.accessLevel}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <UsersIcon className="h-4 w-4 mr-1" />
                                                    {role.userCount || 0}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={role.isActive ? "default" : "secondary"}>
                                                    {role.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={role.isSystemRole ? "destructive" : "outline"}>
                                                    {role.isSystemRole ? "System" : "Custom"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEditRole(role)}
                                                        disabled={role.isSystemRole}
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedRoleForFields(role)
                                                            // Switch to fields tab
                                                            const tabsList = document.querySelector('[role="tablist"]')
                                                            const fieldsTab = tabsList?.querySelector('[value="fields"]') as HTMLElement
                                                            fieldsTab?.click()
                                                        }}
                                                        title="Configure Role Fields"
                                                    >
                                                        <GearIcon className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteRole(role)}
                                                        disabled={role.isSystemRole || Boolean(role.userCount && role.userCount > 0)}
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="fields" className="space-y-6">
                    {selectedRoleForFields ? (
                        <RoleFieldManagement
                            roleId={selectedRoleForFields.id}
                            roleName={selectedRoleForFields.displayName}
                        />
                    ) : (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-8">
                                    <GearIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Select a Role to Configure Fields
                                    </h3>
                                    <p className="text-gray-500">
                                        Choose a role from the Role Management tab to configure its custom fields
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle>
                            {editingRole ? 'Edit Role' : 'Create New Role'}
                        </DialogTitle>
                        <DialogDescription>
                            Configure role details and permissions
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto pr-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Role Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g., custom_doctor"
                                        required
                                        disabled={editingRole?.isSystemRole}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="displayName">Display Name</Label>
                                    <Input
                                        id="displayName"
                                        value={formData.displayName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                                        placeholder="e.g., Custom Doctor"
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
                                    placeholder="Brief description of this role's purpose"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="accessLevel">Access Level (1-10)</Label>
                                    <Input
                                        id="accessLevel"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={formData.accessLevel}
                                        onChange={(e) => setFormData(prev => ({ ...prev, accessLevel: parseInt(e.target.value) }))}
                                        required
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isActive"
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                                    />
                                    <Label htmlFor="isActive">Active</Label>
                                </div>
                            </div>

                            <div>
                                <Label className="text-base font-medium mb-4 block">Permissions</Label>
                                <div className="border rounded-lg p-4 bg-muted/20 max-h-96 overflow-y-auto">
                                    <div className="space-y-6">
                                        {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                                            <div key={module} className="bg-background rounded-lg border p-4">
                                                <div className="flex items-center mb-4">
                                                    <ShieldIcon className="h-5 w-5 mr-2 text-primary" />
                                                    <h3 className="text-lg font-semibold capitalize">
                                                        {module.replace('_', ' ')}
                                                    </h3>
                                                </div>
                                                <div className="space-y-4">
                                                    {modulePermissions.map((permission) => (
                                                        <div key={permission.id} className="border rounded p-3 bg-card">
                                                            <div className="flex items-start justify-between mb-3">
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-sm">{permission.displayName}</div>
                                                                    {permission.description && (
                                                                        <div className="text-xs text-muted-foreground mt-1">
                                                                            {permission.description}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-4 gap-3">
                                                                {availableActions.map((action) => (
                                                                    <div key={action} className="flex items-center space-x-2 p-2 rounded bg-muted/50">
                                                                        <Checkbox
                                                                            id={`${permission.id}-${action}`}
                                                                            checked={getPermissionActions(permission.id).includes(action)}
                                                                            onCheckedChange={(checked) => {
                                                                                const currentActions = getPermissionActions(permission.id);
                                                                                const newActions = checked
                                                                                    ? [...currentActions, action]
                                                                                    : currentActions.filter(a => a !== action);
                                                                                handlePermissionChange(permission.id, newActions);
                                                                            }}
                                                                        />
                                                                        <Label
                                                                            htmlFor={`${permission.id}-${action}`}
                                                                            className="text-sm capitalize font-medium cursor-pointer"
                                                                        >
                                                                            {action}
                                                                        </Label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingRole ? 'Update Role' : 'Create Role'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
