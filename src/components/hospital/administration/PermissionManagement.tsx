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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { httpService } from '@/services/HttpService';
import { Permission, Role } from '@/types/auth';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    ShieldIcon,
    UsersIcon,
    TreeStructureIcon,
    LockIcon,
    ListBulletsIcon,
    GearIcon
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface PermissionGroup {
    module: string;
    permissions: Permission[];
    description?: string;
}

interface FormData {
    name: string;
    module: string;
    description: string;
    isActive: boolean;
    resourceType?: string;
    dependencies?: string[];
}

export default function PermissionManagement() {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
    const [selectedPermissionForAssignment, setSelectedPermissionForAssignment] = useState<Permission | null>(null);

    const [formData, setFormData] = useState<FormData>({
        name: '',
        module: '',
        description: '',
        isActive: true,
        resourceType: '',
        dependencies: []
    });

    const [filters, setFilters] = useState({
        search: '',
        module: 'all',
        status: 'all'
    });

    const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});

    const modules = [
        'system',
        'users',
        'patients',
        'appointments',
        'medical_records',
        'billing',
        'inventory',
        'laboratory',
        'notifications',
        'reports'
    ];

    const availableActions = ['create', 'read', 'update', 'delete', 'assign', 'approve', 'export'];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await Promise.all([
            loadPermissions(),
            loadRoles(),
            loadRolePermissions()
        ]);
        setLoading(false);
    };

    const loadPermissions = async () => {
        try {
            const response = await httpService.get('/roles/permissions');
            if (response.success) {
                setPermissions(response.data);
                groupPermissionsByModule(response.data);
            }
        } catch (error) {
            toast.error('Failed to load permissions');
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

    const loadRolePermissions = async () => {
        try {
            const rolePermissionMap: Record<string, string[]> = {};

            for (const role of roles) {
                if (role.permissions) {
                    rolePermissionMap[role.id] = role.permissions.map(p => p.id);
                }
            }

            setRolePermissions(rolePermissionMap);
        } catch (error) {
            console.error('Failed to load role permissions');
        }
    };

    const groupPermissionsByModule = (permissionList: Permission[]) => {
        const groups: Record<string, Permission[]> = {};

        permissionList.forEach(permission => {
            const module = permission.module || 'general';
            if (!groups[module]) {
                groups[module] = [];
            }
            groups[module].push(permission);
        });

        const groupedData = Object.entries(groups).map(([module, permissions]) => ({
            module,
            permissions,
            description: getModuleDescription(module)
        }));

        setPermissionGroups(groupedData);
    };

    const getModuleDescription = (module: string) => {
        const descriptions: Record<string, string> = {
            system: 'Core system administration and configuration',
            users: 'User and role management',
            patients: 'Patient information and management',
            appointments: 'Appointment scheduling and management',
            medical_records: 'Medical records and documentation',
            billing: 'Billing and financial operations',
            inventory: 'Inventory and stock management',
            laboratory: 'Laboratory tests and results',
            notifications: 'Notification and communication',
            reports: 'Reports and analytics'
        };
        return descriptions[module] || 'General permissions';
    };

    const handleCreatePermission = () => {
        setEditingPermission(null);
        setFormData({
            name: '',
            module: '',
            description: '',
            isActive: true,
            resourceType: '',
            dependencies: []
        });
        setDialogOpen(true);
    };

    const handleEditPermission = (permission: Permission) => {
        setEditingPermission(permission);
        setFormData({
            name: permission.name,
            module: permission.module || '',
            description: permission.description || '',
            isActive: permission.isActive,
            resourceType: permission.resourceType || '',
            dependencies: permission.dependencies || []
        });
        setDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let response;
            if (editingPermission) {
                response = await httpService.put(`/permissions/${editingPermission.id}`, formData);
            } else {
                response = await httpService.post('/permissions', formData);
            }

            if (response.success) {
                toast.success(`Permission ${editingPermission ? 'updated' : 'created'} successfully`);
                setDialogOpen(false);
                loadPermissions();
            }
        } catch (error) {
            toast.error(`Failed to ${editingPermission ? 'update' : 'create'} permission`);
        }
    };

    const handleDeletePermission = async (permission: Permission) => {
        if (confirm(`Are you sure you want to delete the permission "${permission.name}"?`)) {
            try {
                const response = await httpService.delete(`/permissions/${permission.id}`);
                if (response.success) {
                    toast.success('Permission deleted successfully');
                    loadPermissions();
                }
            } catch (error) {
                toast.error('Failed to delete permission');
            }
        }
    };

    const handleAssignPermission = (permission: Permission) => {
        setSelectedPermissionForAssignment(permission);
        setAssignmentDialogOpen(true);
    };

    const handleRolePermissionChange = async (roleId: string, permissionId: string, actions: string[]) => {
        try {
            const response = await httpService.put(`/roles/${roleId}/permissions`, {
                permissions: [{ permissionId, actions }]
            });

            if (response.success) {
                toast.success('Permission assignment updated');
                loadRolePermissions();
            }
        } catch (error) {
            toast.error('Failed to update permission assignment');
        }
    };

    const getRolePermissionActions = (roleId: string, permissionId: string): string[] => {
        const role = roles.find(r => r.id === roleId);
        const permission = role?.permissions?.find(p => p.id === permissionId);
        return permission?.actions || [];
    };

    const hasRolePermission = (roleId: string, permissionId: string): boolean => {
        return rolePermissions[roleId]?.includes(permissionId) || false;
    };

    // Filter permissions based on search and filters
    const filteredPermissions = permissions.filter(permission => {
        const matchesSearch = permission.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            permission.description?.toLowerCase().includes(filters.search.toLowerCase());

        const matchesModule = filters.module === 'all' || permission.module === filters.module;

        const matchesStatus = filters.status === 'all' ||
            (filters.status === 'active' && permission.isActive) ||
            (filters.status === 'inactive' && !permission.isActive);

        return matchesSearch && matchesModule && matchesStatus;
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
                    <h1 className="text-3xl font-bold tracking-tight">Permission Management</h1>
                    <p className="text-muted-foreground">
                        Configure granular permissions and assign them to roles
                    </p>
                </div>
                <Button onClick={handleCreatePermission} className="flex items-center gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Create Permission
                </Button>
            </div>

            <Tabs defaultValue="permissions" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    <TabsTrigger value="assignments">Role Assignments</TabsTrigger>
                    <TabsTrigger value="modules">By Module</TabsTrigger>
                </TabsList>

                <TabsContent value="permissions">
                    {/* Filters */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-wrap gap-4">
                                <div className="flex-1 min-w-64">
                                    <Input
                                        placeholder="Search permissions..."
                                        value={filters.search}
                                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    />
                                </div>
                                <Select
                                    value={filters.module}
                                    onValueChange={(value) => setFilters(prev => ({ ...prev, module: value }))}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Modules</SelectItem>
                                        {modules.map(module => (
                                            <SelectItem key={module} value={module}>
                                                {module.charAt(0).toUpperCase() + module.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permissions Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Permissions ({filteredPermissions.length})</CardTitle>
                            <CardDescription>
                                Manage individual permissions and their properties
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Permission</TableHead>
                                        <TableHead>Module</TableHead>
                                        <TableHead>Roles Assigned</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPermissions.map((permission) => {
                                        const assignedRolesCount = roles.filter(role =>
                                            hasRolePermission(role.id, permission.id)
                                        ).length;

                                        return (
                                            <TableRow key={permission.id}>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="font-medium flex items-center gap-2">
                                                            <ShieldIcon className="h-4 w-4 text-muted-foreground" />
                                                            {permission.name}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {permission.description}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {permission.module || 'general'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <UsersIcon className="h-4 w-4 text-muted-foreground" />
                                                        {assignedRolesCount}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={permission.isActive ? 'default' : 'secondary'}>
                                                        {permission.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleAssignPermission(permission)}
                                                            title="Assign to roles"
                                                        >
                                                            <UsersIcon className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditPermission(permission)}
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeletePermission(permission)}
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="assignments">
                    <Card>
                        <CardHeader>
                            <CardTitle>Role-Permission Assignments</CardTitle>
                            <CardDescription>
                                Manage which permissions are assigned to each role
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {roles.map(role => (
                                    <div key={role.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="font-semibold">{role.displayName}</h3>
                                                <p className="text-sm text-muted-foreground">{role.description}</p>
                                            </div>
                                            <Badge variant={role.isSystemRole ? 'destructive' : 'outline'}>
                                                {role.isSystemRole ? 'System' : 'Custom'}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {permissions.slice(0, 6).map(permission => {
                                                const hasPermission = hasRolePermission(role.id, permission.id);
                                                const actions = getRolePermissionActions(role.id, permission.id);

                                                return (
                                                    <div key={permission.id} className="border rounded p-3">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium">{permission.name}</span>
                                                            <Checkbox
                                                                checked={hasPermission}
                                                                onCheckedChange={(checked) => {
                                                                    const newActions = checked ? ['read'] : [];
                                                                    handleRolePermissionChange(role.id, permission.id, newActions);
                                                                }}
                                                            />
                                                        </div>
                                                        {hasPermission && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {availableActions.slice(0, 4).map(action => (
                                                                    <Badge
                                                                        key={action}
                                                                        variant={actions.includes(action) ? 'default' : 'secondary'}
                                                                        className="text-xs cursor-pointer"
                                                                        onClick={() => {
                                                                            const newActions = actions.includes(action)
                                                                                ? actions.filter(a => a !== action)
                                                                                : [...actions, action];
                                                                            handleRolePermissionChange(role.id, permission.id, newActions);
                                                                        }}
                                                                    >
                                                                        {action}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="modules">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {permissionGroups.map(group => (
                            <Card key={group.module}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TreeStructureIcon className="h-5 w-5" />
                                        {group.module.charAt(0).toUpperCase() + group.module.slice(1)}
                                    </CardTitle>
                                    <CardDescription>{group.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {group.permissions.map(permission => (
                                            <div key={permission.id} className="flex items-center justify-between p-2 border rounded">
                                                <div>
                                                    <div className="font-medium text-sm">{permission.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {permission.description}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={permission.isActive ? 'default' : 'secondary'} className="text-xs">
                                                        {permission.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditPermission(permission)}
                                                    >
                                                        <PencilIcon className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Permission Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingPermission ? 'Edit Permission' : 'Create Permission'}
                        </DialogTitle>
                        <DialogDescription>
                            Configure a system permission
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Permission Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., patients.create"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="module">Module</Label>
                                <Select value={formData.module} onValueChange={(value) => setFormData(prev => ({ ...prev, module: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select module" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {modules.map(module => (
                                            <SelectItem key={module} value={module}>
                                                {module.charAt(0).toUpperCase() + module.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe what this permission allows"
                            />
                        </div>

                        <div>
                            <Label htmlFor="resourceType">Resource Type (Optional)</Label>
                            <Input
                                id="resourceType"
                                value={formData.resourceType}
                                onChange={(e) => setFormData(prev => ({ ...prev, resourceType: e.target.value }))}
                                placeholder="e.g., Patient, Appointment"
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

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingPermission ? 'Update Permission' : 'Create Permission'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Assignment Dialog */}
            <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Permission to Roles</DialogTitle>
                        <DialogDescription>
                            Select roles to assign the permission "{selectedPermissionForAssignment?.name}"
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {roles.map(role => (
                            <div key={role.id} className="flex items-center justify-between p-3 border rounded">
                                <div>
                                    <div className="font-medium">{role.displayName}</div>
                                    <div className="text-sm text-muted-foreground">{role.description}</div>
                                </div>
                                <Checkbox
                                    checked={selectedPermissionForAssignment ? hasRolePermission(role.id, selectedPermissionForAssignment.id) : false}
                                    onCheckedChange={(checked) => {
                                        if (selectedPermissionForAssignment) {
                                            const newActions = checked ? ['read'] : [];
                                            handleRolePermissionChange(role.id, selectedPermissionForAssignment.id, newActions);
                                        }
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={() => setAssignmentDialogOpen(false)}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
