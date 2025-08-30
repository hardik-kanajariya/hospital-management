import { useState, useEffect, useCallback } from 'react';
import { httpService } from '@/services/HttpService';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

interface DashboardStats {
    totalUsers: number;
    activeRoles: number;
    totalPermissions: number;
    systemHealth: string;
}

interface SystemStatus {
    database: 'online' | 'offline' | 'error';
    uptime: string;
    version: string;
    lastBackup?: string;
    performance?: {
        cpu: number;
        memory: number;
        disk: number;
    };
}

interface RecentActivity {
    id: string;
    action: string;
    details: string;
    time: string;
    type: 'role' | 'user' | 'permission' | 'system';
    user?: string;
}

interface SuperAdminDashboardData {
    stats: DashboardStats;
    systemStatus: SystemStatus;
    recentActivities: RecentActivity[];
}

export const useSuperAdminDashboard = () => {
    const [data, setData] = useState<SuperAdminDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all required data in parallel
            const [statsResponse, systemResponse, activitiesResponse] = await Promise.all([
                httpService.get(API_ENDPOINTS.DASHBOARD.SUPER_ADMIN),
                httpService.get(API_ENDPOINTS.SYSTEM.HEALTH),
                httpService.get(API_ENDPOINTS.SYSTEM.AUDIT_TRAIL + '?limit=10&type=admin')
            ]);

            if (statsResponse.success && systemResponse.success && activitiesResponse.success) {
                const dashboardData: SuperAdminDashboardData = {
                    stats: {
                        totalUsers: statsResponse.data?.users?.total || 0,
                        activeRoles: statsResponse.data?.roles?.active || 0,
                        totalPermissions: statsResponse.data?.permissions?.total || 0,
                        systemHealth: systemResponse.data?.status === 'healthy' ? '100%' : '0%'
                    },
                    systemStatus: {
                        database: systemResponse.data?.database?.status || 'offline',
                        uptime: systemResponse.data?.uptime || '0%',
                        version: systemResponse.data?.version || 'Unknown',
                        lastBackup: systemResponse.data?.lastBackup,
                        performance: systemResponse.data?.performance
                    },
                    recentActivities: activitiesResponse.data?.activities?.map((activity: any) => ({
                        id: activity.id,
                        action: activity.action,
                        details: activity.description,
                        time: formatTimeAgo(activity.createdAt),
                        type: activity.type || 'system',
                        user: activity.user?.name
                    })) || []
                };

                setData(dashboardData);
            } else {
                setError('Failed to fetch dashboard data');
            }
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError('An error occurred while fetching dashboard data');
        } finally {
            setLoading(false);
        }
    }, [httpService]);

    const refreshData = useCallback(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const createSystemBackup = useCallback(async () => {
        try {
            const response = await httpService.post(API_ENDPOINTS.SYSTEM.BACKUP, {});
            if (response.success) {
                // Refresh data to update last backup time
                await fetchDashboardData();
                return { success: true, message: 'System backup created successfully' };
            } else {
                return { success: false, message: response.error || 'Failed to create backup' };
            }
        } catch (error) {
            console.error('Backup creation error:', error);
            return { success: false, message: 'An error occurred while creating backup' };
        }
    }, [fetchDashboardData]);

    const getSystemLogs = useCallback(async (limit: number = 50) => {
        try {
            const response = await httpService.get(`${API_ENDPOINTS.SYSTEM.LOGS}?limit=${limit}`);
            if (response.success) {
                return { success: true, data: response.data };
            } else {
                return { success: false, message: response.error || 'Failed to fetch logs' };
            }
        } catch (error) {
            console.error('Log fetch error:', error);
            return { success: false, message: 'An error occurred while fetching logs' };
        }
    }, [httpService]);

    const getSystemPerformance = useCallback(async () => {
        try {
            const response = await httpService.get(API_ENDPOINTS.SYSTEM.PERFORMANCE);
            if (response.success) {
                return { success: true, data: response.data };
            } else {
                return { success: false, message: response.error || 'Failed to fetch performance data' };
            }
        } catch (error) {
            console.error('Performance fetch error:', error);
            return { success: false, message: 'An error occurred while fetching performance data' };
        }
    }, [httpService]);

    const updateSystemSettings = useCallback(async (settings: any) => {
        try {
            const response = await httpService.put(API_ENDPOINTS.HOSPITAL.SETTINGS, settings);
            if (response.success) {
                return { success: true, message: 'System settings updated successfully' };
            } else {
                return { success: false, message: response.error || 'Failed to update settings' };
            }
        } catch (error) {
            console.error('Settings update error:', error);
            return { success: false, message: 'An error occurred while updating settings' };
        }
    }, [httpService]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return {
        data,
        loading,
        error,
        refreshData,
        createSystemBackup,
        getSystemLogs,
        getSystemPerformance,
        updateSystemSettings
    };
};

// Helper function to format time ago
const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
        return 'Just now';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else {
        const days = Math.floor(diffInMinutes / 1440);
        return `${days} day${days === 1 ? '' : 's'} ago`;
    }
};

export default useSuperAdminDashboard;
