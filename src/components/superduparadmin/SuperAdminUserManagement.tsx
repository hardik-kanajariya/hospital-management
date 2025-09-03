import React, { useState, useEffect } from 'react';
import { useSuperDuparAdminAuth } from '../../hooks/useSuperDuparAdminAuth2';
import {
    Users,
    Plus,
    Search,
    Filter,
    UserCheck,
    UserX,
    Edit,
    Building2,
    Mail,
    Phone
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
// Simple toast implementation
const toast = (options: { title: string; description: string; variant?: 'destructive' }) => {
    console.log(`${options.title}: ${options.description}`);
    alert(`${options.title}: ${options.description}`);
};
import { httpService } from '../../services/HttpService';

interface SuperAdmin {
    id: string;
    email: string;
    name: string;
    phone?: string;
    department?: string;
    employeeId?: string;
    isActive: boolean;
    organization?: {
        id: string;
        name: string;
    };
    createdAt: string;
}

interface Organization {
    id: string;
    name: string;
    status: string;
}

export default function SuperAdminUserManagement() {
    const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        organizationId: '',
        status: 'all'
    });
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<SuperAdmin | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        phone: '',
        department: '',
        employeeId: '',
        organizationId: '',
        isActive: true
    });

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        try {
            const [superAdminsResponse, organizationsResponse] = await Promise.all([
                httpService.get('/super-dupar-admin/super-admins'),
                httpService.get('/super-dupar-admin/organizations')
            ]);

            if (superAdminsResponse.success) {
                setSuperAdmins(superAdminsResponse.data.data || []);
            }

            if (organizationsResponse.success) {
                setOrganizations(organizationsResponse.data.data || []);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load super admins data',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSuperAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await httpService.post('/super-dupar-admin/super-admins', formData);

            if (response.success) {
                toast({
                    title: 'Success',
                    description: 'Super admin created successfully'
                });
                setCreateDialogOpen(false);
                resetForm();
                loadData();
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create super admin',
                variant: 'destructive'
            });
        }
    };

    const handleUpdateSuperAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            const response = await httpService.put(`/super-dupar-admin/super-admins/${editingUser.id}`, formData);

            if (response.success) {
                toast({
                    title: 'Success',
                    description: 'Super admin updated successfully'
                });
                setEditingUser(null);
                resetForm();
                loadData();
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update super admin',
                variant: 'destructive'
            });
        }
    };

    const handleToggleStatus = async (user: SuperAdmin) => {
        try {
            const response = await httpService.patch(`/super-dupar-admin/super-admins/${user.id}/status`, {
                isActive: !user.isActive
            });

            if (response.success) {
                toast({
                    title: 'Success',
                    description: `Super admin ${!user.isActive ? 'activated' : 'suspended'} successfully`
                });
                loadData();
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update super admin status',
                variant: 'destructive'
            });
        }
    };

    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            name: '',
            phone: '',
            department: '',
            employeeId: '',
            organizationId: '',
            isActive: true
        });
    };

    const handleEdit = (user: SuperAdmin) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            password: '',
            name: user.name,
            phone: user.phone || '',
            department: user.department || '',
            employeeId: user.employeeId || '',
            organizationId: user.organization?.id || '',
            isActive: user.isActive
        });
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
                    <h1 className="text-3xl font-bold tracking-tight">Super Admin Management</h1>
                    <p className="text-muted-foreground">
                        Manage super administrators across all organizations
                    </p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Super Admin
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-64">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search super admins..."
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <Select
                            value={filters.organizationId}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, organizationId: value }))}
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="All Organizations" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Organizations</SelectItem>
                                {organizations.map((org) => (
                                    <SelectItem key={org.id} value={org.id}>
                                        {org.name}
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

            {/* Super Admins Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Super Administrators ({superAdmins.length})</CardTitle>
                    <CardDescription>
                        Manage super administrators and their permissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Organization</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {superAdmins.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{user.name}</div>
                                            {user.employeeId && (
                                                <div className="text-sm text-muted-foreground">ID: {user.employeeId}</div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            {user.email}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            {user.organization?.name || 'No Organization'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {user.phone ? (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                {user.phone}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">No phone</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(user)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggleStatus(user)}
                                            >
                                                {user.isActive ? (
                                                    <UserX className="h-4 w-4" />
                                                ) : (
                                                    <UserCheck className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={createDialogOpen || !!editingUser} onOpenChange={(open) => {
                if (!open) {
                    setCreateDialogOpen(false);
                    setEditingUser(null);
                    resetForm();
                }
            }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingUser ? 'Edit Super Admin' : 'Create Super Admin'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingUser ? 'Update super admin details' : 'Create a new super administrator'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={editingUser ? handleUpdateSuperAdmin : handleCreateSuperAdmin} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                required
                                disabled={!!editingUser}
                            />
                        </div>
                        {!editingUser && (
                            <div>
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    required
                                />
                            </div>
                        )}
                        <div>
                            <Label htmlFor="organizationId">Organization *</Label>
                            <Select
                                value={formData.organizationId}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, organizationId: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Organization" />
                                </SelectTrigger>
                                <SelectContent>
                                    {organizations.map((org) => (
                                        <SelectItem key={org.id} value={org.id}>
                                            {org.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="department">Department</Label>
                            <Input
                                id="department"
                                value={formData.department}
                                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
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
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                            />
                            <Label htmlFor="isActive">Active</Label>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setCreateDialogOpen(false);
                                    setEditingUser(null);
                                    resetForm();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingUser ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
