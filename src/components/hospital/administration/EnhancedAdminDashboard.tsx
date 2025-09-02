import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { httpService } from '@/services/HttpService';
import { Role, Permission } from '@/types/auth';
import {
    UsersIcon,
    ShieldIcon,
    GearIcon,
    ChartBarIcon,
    WarningCircleIcon,
    CheckCircleIcon,
    ClockIcon,
    TrendUpIcon,
    UsersThreeIcon,
    LockIcon,
    BellIcon,
    EyeIcon,
    PlusIcon
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface DashboardStats {
    totalRoles: number;
    activeRoles: number;
    totalPermissions: number;
    activePermissions: number;
    totalUsers: number;
    activeUsers: number;
    organizationsCount: number;
    recentActivity: ActivityItem[];
    systemHealth: {
        status: 'healthy' | 'warning' | 'error';
        issues: string[];
    };
    roleDistribution: Array<{
        roleId: string;
        roleName: string;
        userCount: number;
        percentage: number;
    }>;
    permissionUsage: Array<{
        module: string;
        permissionCount: number;
        assignedCount: number;
        utilizationRate: number;
    }>;
}

interface ActivityItem {
    id: string;
    action: string;
    user: string;
    target: string;
    timestamp: string;
    type: 'role_created' | 'role_updated' | 'role_deleted' | 'permission_assigned' | 'user_role_changed' | 'bulk_operation';
}

export default function EnhancedAdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentRoles, setRecentRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTimeRange, setSelectedTimeRange] = useState('7d'); // 1d, 7d, 30d

    useEffect(() => {
        loadDashboardData();
    }, [selectedTimeRange]);

    const loadDashboardData = async () => {
        try {
            await Promise.all([
                loadStats(),
                loadRecentRoles()
            ]);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            // In a real implementation, this would be a single API call
            const [rolesResponse, permissionsResponse, usersResponse] = await Promise.all([
                httpService.get('/roles'),
                httpService.get('/roles/permissions'),
                httpService.get('/users') // This endpoint might not exist yet
            ]);

            // Mock data for demonstration - replace with actual API responses
            const mockStats: DashboardStats = {
                totalRoles: rolesResponse.success ? rolesResponse.data.length : 12,
                activeRoles: rolesResponse.success ? rolesResponse.data.filter((r: Role) => r.isActive).length : 10,
                totalPermissions: permissionsResponse.success ? permissionsResponse.data.length : 45,
                activePermissions: permissionsResponse.success ? permissionsResponse.data.filter((p: Permission) => p.isActive).length : 42,
                totalUsers: 128,
                activeUsers: 115,
                organizationsCount: 3,
                recentActivity: [
                    {
                        id: '1',
                        action: 'Created role "Cardiologist"',
                        user: 'Dr. Admin',
                        target: 'Role Management',
                        timestamp: '2024-01-15T10:30:00Z',
                        type: 'role_created'
                    },
                    {
                        id: '2',
                        action: 'Updated permissions for Nurse role',
                        user: 'System Admin',
                        target: 'Permission Management',
                        timestamp: '2024-01-15T09:15:00Z',
                        type: 'permission_assigned'
                    },
                    {
                        id: '3',
                        action: 'Bulk deactivated 5 roles',
                        user: 'Super Admin',
                        target: 'Bulk Operations',
                        timestamp: '2024-01-15T08:45:00Z',
                        type: 'bulk_operation'
                    }
                ],
                systemHealth: {
                    status: 'healthy',
                    issues: []
                },
                roleDistribution: [
                    { roleId: '1', roleName: 'Doctor', userCount: 45, percentage: 35.2 },
                    { roleId: '2', roleName: 'Nurse', userCount: 38, percentage: 29.7 },
                    { roleId: '3', roleName: 'Receptionist', userCount: 15, percentage: 11.7 },
                    { roleId: '4', roleName: 'Administrator', userCount: 8, percentage: 6.3 },
                    { roleId: '5', roleName: 'Lab Technician', userCount: 12, percentage: 9.4 },
                    { roleId: '6', roleName: 'Other', userCount: 10, percentage: 7.8 }
                ],
                permissionUsage: [
                    { module: 'patients', permissionCount: 8, assignedCount: 6, utilizationRate: 75 },
                    { module: 'appointments', permissionCount: 6, assignedCount: 5, utilizationRate: 83.3 },
                    { module: 'medical_records', permissionCount: 7, assignedCount: 4, utilizationRate: 57.1 },
                    { module: 'billing', permissionCount: 5, assignedCount: 3, utilizationRate: 60 },
                    { module: 'inventory', permissionCount: 6, assignedCount: 4, utilizationRate: 66.7 },
                    { module: 'laboratory', permissionCount: 4, assignedCount: 3, utilizationRate: 75 }
                ]
            };

            setStats(mockStats);
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
        }
    };

    const loadRecentRoles = async () => {
        try {
            const response = await httpService.get('/roles');
            if (response.success) {
                // Sort by created date and take first 5
                const sortedRoles = response.data
                    .sort((a: Role, b: Role) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
                    .slice(0, 5);
                setRecentRoles(sortedRoles);
            }
        } catch (error) {
            console.error('Failed to load recent roles:', error);
        }
    };

    const getActivityIcon = (type: ActivityItem['type']) => {
        const iconMap = {
            'role_created': PlusIcon,
            'role_updated': GearIcon,
            'role_deleted': WarningCircleIcon,
            'permission_assigned': LockIcon,
            'user_role_changed': UsersThreeIcon,
            'bulk_operation': GearIcon
        };
        return iconMap[type] || BellIcon;
    };

    const getActivityColor = (type: ActivityItem['type']) => {
        const colorMap = {
            'role_created': 'text-green-600',
            'role_updated': 'text-blue-600',
            'role_deleted': 'text-red-600',
            'permission_assigned': 'text-purple-600',
            'user_role_changed': 'text-orange-600',
            'bulk_operation': 'text-gray-600'
        };
        return colorMap[type] || 'text-gray-600';
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    if (loading || !stats) {
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
                    <h1 className="text-3xl font-bold tracking-tight">Administration Dashboard</h1>
                    <p className="text-muted-foreground">
                        Overview of role management, permissions, and system health
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/admin/roles')}
                        className="flex items-center gap-2"
                    >
                        <ShieldIcon className="h-4 w-4" />
                        Manage Roles
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/admin/permissions')}
                        className="flex items-center gap-2"
                    >
                        <LockIcon className="h-4 w-4" />
                        Manage Permissions
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
                        <ShieldIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalRoles}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.activeRoles} active
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Permissions</CardTitle>
                        <LockIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalPermissions}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.activePermissions} active
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <UsersIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.activeUsers} active
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Organizations</CardTitle>
                        <UsersThreeIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.organizationsCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Multi-tenant
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* System Health */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {stats.systemHealth.status === 'healthy' ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        ) : stats.systemHealth.status === 'warning' ? (
                            <WarningCircleIcon className="h-5 w-5 text-yellow-600" />
                        ) : (
                            <WarningCircleIcon className="h-5 w-5 text-red-600" />
                        )}
                        System Health
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <Badge
                                variant={stats.systemHealth.status === 'healthy' ? 'default' : 'destructive'}
                                className="mb-2"
                            >
                                {stats.systemHealth.status.toUpperCase()}
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                                {stats.systemHealth.issues.length === 0
                                    ? 'All systems operating normally'
                                    : `${stats.systemHealth.issues.length} issue(s) detected`
                                }
                            </p>
                        </div>
                        <Button variant="outline" size="sm">
                            <EyeIcon className="h-4 w-4 mr-2" />
                            View Details
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="analytics" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                    <TabsTrigger value="roles">Recent Roles</TabsTrigger>
                </TabsList>

                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Role Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Role Distribution</CardTitle>
                                <CardDescription>
                                    Users across different roles
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {stats.roleDistribution.map((role) => (
                                        <div key={role.roleId} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{role.roleName}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {role.userCount} users ({role.percentage}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${role.percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Permission Usage */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Permission Utilization</CardTitle>
                                <CardDescription>
                                    How permissions are used across modules
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {stats.permissionUsage.map((module) => (
                                        <div key={module.module} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium capitalize">{module.module}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {module.assignedCount}/{module.permissionCount} ({module.utilizationRate}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${module.utilizationRate >= 80 ? 'bg-green-600' :
                                                            module.utilizationRate >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                                                        }`}
                                                    style={{ width: `${module.utilizationRate}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="activity">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                Latest role and permission changes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats.recentActivity.map((activity) => {
                                    const ActivityIcon = getActivityIcon(activity.type);
                                    return (
                                        <div key={activity.id} className="flex items-center gap-4 p-3 border rounded-lg">
                                            <div className={`p-2 rounded-full ${getActivityColor(activity.type)} bg-opacity-10`}>
                                                <ActivityIcon className={`h-4 w-4 ${getActivityColor(activity.type)}`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">{activity.action}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    by {activity.user} in {activity.target}
                                                </div>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {formatTimestamp(activity.timestamp)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="roles">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recently Created Roles</CardTitle>
                            <CardDescription>
                                Latest roles added to the system
                            </CardDescription>
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
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentRoles.map((role) => (
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
                                                <Badge
                                                    className={
                                                        role.accessLevel >= 80 ? 'bg-red-100 text-red-800' :
                                                            role.accessLevel >= 60 ? 'bg-orange-100 text-orange-800' :
                                                                role.accessLevel >= 40 ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-green-100 text-green-800'
                                                    }
                                                >
                                                    {role.accessLevel}
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
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
