import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import RoleManagement from './RoleManagement';
import SuperAdminUserManagement from './SuperAdminUserManagement';
import {
    UsersIcon,
    ShieldIcon,
    GearIcon,
    ChartBarIcon,
    DatabaseIcon,
    WrenchIcon
} from '@phosphor-icons/react';

export default function SuperAdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    const stats = [
        {
            title: 'Total Users',
            value: '0',
            description: 'Active staff members',
            icon: UsersIcon,
            color: 'text-blue-600'
        },
        {
            title: 'Active Roles',
            value: '0',
            description: 'Configured roles',
            icon: ShieldIcon,
            color: 'text-green-600'
        },
        {
            title: 'Permissions',
            value: '0',
            description: 'System permissions',
            icon: GearIcon,
            color: 'text-purple-600'
        },
        {
            title: 'System Health',
            value: '100%',
            description: 'All systems operational',
            icon: ChartBarIcon,
            color: 'text-emerald-600'
        }
    ];

    const recentActivities = [
        {
            action: 'Role Created',
            details: 'New "Senior Doctor" role created',
            time: '2 hours ago',
            type: 'role'
        },
        {
            action: 'User Added',
            details: 'Dr. Sarah Johnson added as Senior Doctor',
            time: '3 hours ago',
            type: 'user'
        },
        {
            action: 'Permission Updated',
            details: 'Billing permissions modified for Nurses',
            time: '1 day ago',
            type: 'permission'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        Manage system users, roles, and permissions
                    </p>
                </div>
                <Badge variant="outline" className="text-sm">
                    <ShieldIcon className="h-4 w-4 mr-1" />
                    Super Administrator
                </Badge>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="roles">Roles</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <Card key={index}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {stat.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>
                                    Latest system administration actions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentActivities.map((activity, index) => (
                                        <div key={index} className="flex items-start space-x-3">
                                            <div className={`h-2 w-2 rounded-full mt-2 ${activity.type === 'role' ? 'bg-blue-500' :
                                                    activity.type === 'user' ? 'bg-green-500' :
                                                        'bg-purple-500'
                                                }`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium">{activity.action}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {activity.details}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {activity.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                                <CardDescription>
                                    Common administrative tasks
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        className="p-4 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                                        onClick={() => setActiveTab('users')}
                                    >
                                        <UsersIcon className="h-8 w-8 text-blue-600 mb-2" />
                                        <h3 className="font-medium">Add User</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Create new staff account
                                        </p>
                                    </div>

                                    <div
                                        className="p-4 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                                        onClick={() => setActiveTab('roles')}
                                    >
                                        <ShieldIcon className="h-8 w-8 text-green-600 mb-2" />
                                        <h3 className="font-medium">Manage Roles</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Configure permissions
                                        </p>
                                    </div>

                                    <div className="p-4 border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                                        <DatabaseIcon className="h-8 w-8 text-purple-600 mb-2" />
                                        <h3 className="font-medium">System Backup</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Create data backup
                                        </p>
                                    </div>

                                    <div className="p-4 border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                                        <WrenchIcon className="h-8 w-8 text-orange-600 mb-2" />
                                        <h3 className="font-medium">System Settings</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Configure system
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* System Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>System Status</CardTitle>
                            <CardDescription>
                                Current system health and performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">Online</div>
                                    <p className="text-sm text-muted-foreground">Database Status</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">100%</div>
                                    <p className="text-sm text-muted-foreground">System Uptime</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">v1.0.0</div>
                                    <p className="text-sm text-muted-foreground">Current Version</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="users">
                    <SuperAdminUserManagement />
                </TabsContent>

                <TabsContent value="roles">
                    <RoleManagement />
                </TabsContent>
            </Tabs>
        </div>
    );
}
