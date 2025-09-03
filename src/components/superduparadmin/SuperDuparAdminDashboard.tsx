import React, { useState, useEffect } from 'react';
import {
    Users,
    Building2,
    Activity,
    TrendingUp,
    UserCheck,
    Settings,
    Bell,
    Calendar,
    BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useSuperDuparAdminAuth } from '../../hooks/useSuperDuparAdminAuth';
import { httpService } from '../../services/HttpService';

interface DashboardStats {
    organizations: {
        total: number;
        active: number;
    };
    superAdmins: {
        total: number;
        active: number;
    };
    users: {
        total: number;
        active: number;
    };
}

interface RecentActivity {
    id: string;
    action: string;
    entityType: string;
    details: Record<string, any>;
    createdAt: string;
}

export default function SuperDuparAdminDashboard() {
    const { user } = useSuperDuparAdminAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [statsResponse, activitiesResponse] = await Promise.all([
                httpService.get('/super-dupar-admin/dashboard-stats'),
                httpService.get('/super-dupar-admin/activities?limit=5')
            ]);

            if (statsResponse.success) {
                setStats(statsResponse.data);
            }

            if (activitiesResponse.success) {
                setRecentActivities(activitiesResponse.data);
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatActivityAction = (action: string) => {
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getActivityIcon = (action: string) => {
        if (action.includes('login')) return <UserCheck className="h-4 w-4" />;
        if (action.includes('create')) return <Users className="h-4 w-4" />;
        if (action.includes('update')) return <Settings className="h-4 w-4" />;
        if (action.includes('suspend') || action.includes('activate')) return <Activity className="h-4 w-4" />;
        return <Bell className="h-4 w-4" />;
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
                    <h1 className="text-3xl font-bold tracking-tight">Super Dupar Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back, {user?.name}. Here's what's happening across your system.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Reports
                    </Button>
                    <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.organizations.total}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-600">{stats.organizations.active} active</span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.superAdmins.total}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-600">{stats.superAdmins.active} active</span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.users.total}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-600">{stats.users.active} active</span>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                        Commonly used administrative functions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <Users className="h-6 w-6" />
                            <span>Manage Super Admins</span>
                        </Button>
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <Building2 className="h-6 w-6" />
                            <span>View Organizations</span>
                        </Button>
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <Activity className="h-6 w-6" />
                            <span>System Activity</span>
                        </Button>
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <Settings className="h-6 w-6" />
                            <span>System Settings</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Recent Activities
                    </CardTitle>
                    <CardDescription>
                        Your recent system administration activities
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {recentActivities.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            No recent activities found
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        {getActivityIcon(activity.action)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">
                                            {formatActivityAction(activity.action)}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {activity.details.message || `${activity.entityType} action performed`}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <Badge variant="outline" className="text-xs">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {new Date(activity.createdAt).toLocaleDateString()}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
