import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
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
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
        loadRoles();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await httpService.get('/users');
            if (response.success) {
                // Handle paginated response - users are in response.data.data
                const users = response.data.data || response.data || [];
                setUsers(Array.isArray(users) ? users : []);
            }
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Failed to load users');
            setUsers([]); // Ensure users is always an array
        } finally {
            setLoading(false);
        }
    };

    const loadRoles = async () => {
        try {
            const response = await httpService.get('/roles');
            if (response.success) {
                const roles = response.data || [];
                setRoles(Array.isArray(roles) ? roles.filter((role: Role) => role.isActive) : []);
            }
        } catch (error) {
            console.error('Error loading roles:', error);
            toast.error('Failed to load roles');
            setRoles([]); // Ensure roles is always an array
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = () => {
        const preSelectedRole = searchParams.get('role');
        if (preSelectedRole) {
            navigate(`/users/create?role=${preSelectedRole}`);
        } else {
            navigate('/users/create');
        }
    };

    // Helper function to check if user has super admin role
    const isSuperAdmin = (user: User): boolean => {
        if (typeof user.role === 'object' && user.role?.name) {
            return user.role.name === 'super_admin';
        }
        if (user.roleId) {
            const role = roles.find(r => r.id === user.roleId);
            return role?.name === 'super_admin';
        }
        return typeof user.role === 'string' && user.role === 'super_admin';
    };

    const handleEditUser = (user: User) => {
        // Prevent editing super admin users
        if (isSuperAdmin(user)) {
            toast.error('Super Administrator users cannot be modified');
            return;
        }

        navigate(`/users/${user.id}/edit`);
    };

    const handleViewUser = (user: User) => {
        navigate(`/users/${user.id}/view`);
    };

    const handleDeleteUser = async (user: User) => {
        // Prevent deleting super admin users
        if (isSuperAdmin(user)) {
            toast.error('Super Administrator users cannot be deleted');
            return;
        }

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
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Hospital Staff</CardTitle>
                            <CardDescription>
                                Manage user accounts and their roles
                            </CardDescription>
                        </div>
                        <Button onClick={handleCreateUser}>
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Create User
                        </Button>
                    </div>
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
                            {Array.isArray(users) && users.length > 0 ? (
                                users.map((user) => (
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
                                            <div className="flex items-center space-x-2">
                                                <Badge variant={isSuperAdmin(user) ? "destructive" : "secondary"}>
                                                    {getRoleName(user)}
                                                </Badge>
                                                {isSuperAdmin(user) && (
                                                    <div title="Protected User">
                                                        <ShieldCheckIcon className="h-4 w-4 text-red-500" />
                                                    </div>
                                                )}
                                            </div>
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
                                                    disabled={isSuperAdmin(user)}
                                                    title={isSuperAdmin(user) ? 'Super Admin users cannot be modified' : 'Edit user'}
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteUser(user)}
                                                    disabled={isSuperAdmin(user)}
                                                    title={isSuperAdmin(user) ? 'Super Admin users cannot be deleted' : 'Delete user'}
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        {Array.isArray(users) ? 'No users found' : 'Loading users...'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
