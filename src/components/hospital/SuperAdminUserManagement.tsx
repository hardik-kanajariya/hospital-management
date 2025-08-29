import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { httpService } from '@/services/HttpService';
import { User, Role } from '@/types/auth';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    UserIcon,
    ShieldCheckIcon,
    EyeIcon
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface UserFormData {
    name: string;
    email: string;
    password: string;
    roleId: string;
    phone: string;
    department: string;
    employeeId: string;
    isActive: boolean;
}

export default function SuperAdminUserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [viewingUser, setViewingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<UserFormData>({
        name: '',
        email: '',
        password: '',
        roleId: '',
        phone: '',
        department: '',
        employeeId: '',
        isActive: true
    });

    useEffect(() => {
        loadUsers();
        loadRoles();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await httpService.get('/users');
            if (response.success) {
                setUsers(response.data);
            }
        } catch (error) {
            toast.error('Failed to load users');
        }
    };

    const loadRoles = async () => {
        try {
            const response = await httpService.get('/roles');
            if (response.success) {
                setRoles(response.data.filter((role: Role) => role.isActive));
            }
        } catch (error) {
            toast.error('Failed to load roles');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            roleId: '',
            phone: '',
            department: '',
            employeeId: '',
            isActive: true
        });
        setDialogOpen(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            roleId: user.roleId || '',
            phone: user.phone || '',
            department: user.department || '',
            employeeId: user.employeeId || '',
            isActive: user.isActive
        });
        setDialogOpen(true);
    };

    const handleViewUser = (user: User) => {
        setViewingUser(user);
    };

    const handleDeleteUser = async (user: User) => {
        if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
            try {
                const response = await httpService.delete(`/users/${user.id}`);
                if (response.success) {
                    toast.success('User deleted successfully');
                    loadUsers();
                }
            } catch (error) {
                toast.error('Failed to delete user');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload = {
                ...formData,
                phone: formData.phone || undefined,
                department: formData.department || undefined,
                employeeId: formData.employeeId || undefined
            };

            let response;

            // Remove password if editing and password is empty
            if (editingUser && !formData.password) {
                const { password, ...payloadWithoutPassword } = payload;
                response = await httpService.put(`/users/${editingUser.id}`, payloadWithoutPassword);
            } else {
                response = editingUser
                    ? await httpService.put(`/users/${editingUser.id}`, payload)
                    : await httpService.post('/users', payload);
            }

            if (response.success) {
                toast.success(`User ${editingUser ? 'updated' : 'created'} successfully`);
                setDialogOpen(false);
                loadUsers();
            }
        } catch (error) {
            toast.error(`Failed to ${editingUser ? 'update' : 'create'} user`);
        }
    };

    const getRoleName = (user: User): string => {
        if (typeof user.role === 'object' && user.role?.displayName) {
            return user.role.displayName;
        }
        if (user.roleId) {
            const role = roles.find(r => r.id === user.roleId);
            return role?.displayName || 'Unknown Role';
        }
        return typeof user.role === 'string' ? user.role : 'No Role';
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center">Loading users...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-muted-foreground">
                        Manage all hospital staff and their access permissions
                    </p>
                </div>
                <Button onClick={handleCreateUser}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create User
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Hospital Staff</CardTitle>
                    <CardDescription>
                        Manage user accounts and their roles
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Employee ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Login</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <UserIcon className="h-8 w-8 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {getRoleName(user)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{user.department || '-'}</TableCell>
                                    <TableCell>{user.employeeId || '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.isActive ? "default" : "secondary"}>
                                            {user.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.lastLogin
                                            ? new Date(user.lastLogin).toLocaleDateString()
                                            : 'Never'
                                        }
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewUser(user)}
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditUser(user)}
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteUser(user)}
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

            {/* Create/Edit User Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingUser ? 'Edit User' : 'Create New User'}
                        </DialogTitle>
                        <DialogDescription>
                            Configure user details and assign role
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="password">
                                Password {editingUser && '(leave empty to keep current)'}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                required={!editingUser}
                            />
                        </div>

                        <div>
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={formData.roleId}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, roleId: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id}>
                                            {role.displayName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="employeeId">Employee ID</Label>
                                <Input
                                    id="employeeId"
                                    value={formData.employeeId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="department">Department</Label>
                            <Input
                                id="department"
                                value={formData.department}
                                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
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

                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingUser ? 'Update User' : 'Create User'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View User Dialog */}
            <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>
                            View user information and permissions
                        </DialogDescription>
                    </DialogHeader>

                    {viewingUser && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Name</Label>
                                    <div className="font-medium">{viewingUser.name}</div>
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <div className="font-medium">{viewingUser.email}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Role</Label>
                                    <div className="font-medium">{getRoleName(viewingUser)}</div>
                                </div>
                                <div>
                                    <Label>Status</Label>
                                    <Badge variant={viewingUser.isActive ? "default" : "secondary"}>
                                        {viewingUser.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Department</Label>
                                    <div className="font-medium">{viewingUser.department || '-'}</div>
                                </div>
                                <div>
                                    <Label>Employee ID</Label>
                                    <div className="font-medium">{viewingUser.employeeId || '-'}</div>
                                </div>
                            </div>

                            <div>
                                <Label>Permissions</Label>
                                <div className="mt-2 space-y-2">
                                    {viewingUser.permissions.map((permission, index) => (
                                        <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                                            <span className="capitalize">{permission.module.replace('_', ' ')}</span>
                                            <div className="flex space-x-1">
                                                {permission.actions?.map((action) => (
                                                    <Badge key={action} variant="outline" className="text-xs">
                                                        {action}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Created</Label>
                                    <div className="text-sm text-muted-foreground">
                                        {new Date(viewingUser.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <Label>Last Login</Label>
                                    <div className="text-sm text-muted-foreground">
                                        {viewingUser.lastLogin
                                            ? new Date(viewingUser.lastLogin).toLocaleString()
                                            : 'Never'
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
