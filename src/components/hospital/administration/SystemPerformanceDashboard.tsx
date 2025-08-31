import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { httpService } from '@/services/HttpService';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import {
    ChartBarIcon,
    CpuIcon,
    CircuitryIcon,
    ArrowClockwiseIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@phosphor-icons/react';

interface PerformanceMetrics {
    cpu: number;
    memory: number;
    disk: number;
}

interface SystemHealth {
    status: 'healthy' | 'unhealthy';
    database: {
        status: 'online' | 'offline';
        latency: number;
    };
    uptime: string;
    version: string;
    lastBackup?: string;
    performance: PerformanceMetrics;
}

export default function SystemPerformanceDashboard() {
    const [healthData, setHealthData] = useState<SystemHealth | null>(null);
    const [performanceData, setPerformanceData] = useState<PerformanceMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHealthData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [healthResponse, performanceResponse] = await Promise.all([
                httpService.get(API_ENDPOINTS.SYSTEM.HEALTH),
                httpService.get(API_ENDPOINTS.SYSTEM.PERFORMANCE)
            ]);

            if (healthResponse.success) {
                setHealthData(healthResponse.data);
            }

            if (performanceResponse.success) {
                setPerformanceData(performanceResponse.data);
            }

        } catch (err) {
            console.error('Failed to fetch system data:', err);
            setError('Failed to load system performance data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealthData();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchHealthData, 30000);
        return () => clearInterval(interval);
    }, []);

    const getPerformanceColor = (percentage: number) => {
        if (percentage >= 90) return 'text-red-600';
        if (percentage >= 70) return 'text-yellow-600';
        return 'text-green-600';
    };

    const getPerformanceStatus = (percentage: number) => {
        if (percentage >= 90) return 'Critical';
        if (percentage >= 70) return 'Warning';
        return 'Good';
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ChartBarIcon className="h-5 w-5" />
                        System Performance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <ArrowClockwiseIcon className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Loading performance data...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ChartBarIcon className="h-5 w-5" />
                        System Performance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8 text-red-600">
                        <XCircleIcon className="h-6 w-6 mr-2" />
                        {error}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const performance = performanceData || healthData?.performance;

    return (
        <div className="space-y-6">
            {/* System Status Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ChartBarIcon className="h-5 w-5" />
                        System Status Overview
                    </CardTitle>
                    <CardDescription>
                        Real-time system health and performance metrics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Overall Status */}
                        <div className="flex items-center gap-3">
                            {healthData?.status === 'healthy' ? (
                                <CheckCircleIcon className="h-8 w-8 text-green-600" />
                            ) : (
                                <XCircleIcon className="h-8 w-8 text-red-600" />
                            )}
                            <div>
                                <div className="font-medium">Overall Status</div>
                                <Badge
                                    variant={healthData?.status === 'healthy' ? 'default' : 'destructive'}
                                    className="mt-1"
                                >
                                    {healthData?.status === 'healthy' ? 'Healthy' : 'Unhealthy'}
                                </Badge>
                            </div>
                        </div>

                        {/* Database Status */}
                        <div className="flex items-center gap-3">
                            {healthData?.database.status === 'online' ? (
                                <CheckCircleIcon className="h-8 w-8 text-green-600" />
                            ) : (
                                <XCircleIcon className="h-8 w-8 text-red-600" />
                            )}
                            <div>
                                <div className="font-medium">Database</div>
                                <Badge
                                    variant={healthData?.database.status === 'online' ? 'default' : 'destructive'}
                                    className="mt-1"
                                >
                                    {healthData?.database.status === 'online' ? 'Online' : 'Offline'}
                                </Badge>
                                {healthData?.database.latency && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {healthData.database.latency}ms latency
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Uptime */}
                        <div>
                            <div className="font-medium">System Uptime</div>
                            <div className="text-2xl font-bold text-green-600">
                                {healthData?.uptime || '0%'}
                            </div>
                        </div>

                        {/* Version */}
                        <div>
                            <div className="font-medium">Version</div>
                            <div className="text-lg font-semibold">
                                {healthData?.version || 'Unknown'}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Performance Metrics */}
            {performance && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CpuIcon className="h-5 w-5" />
                            Performance Metrics
                        </CardTitle>
                        <CardDescription>
                            Current system resource utilization
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* CPU Usage */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CircuitryIcon className="h-4 w-4" />
                                        <span className="font-medium">CPU Usage</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-semibold ${getPerformanceColor(performance.cpu)}`}>
                                            {performance.cpu.toFixed(1)}%
                                        </span>
                                        <Badge
                                            variant={performance.cpu >= 90 ? 'destructive' : performance.cpu >= 70 ? 'outline' : 'default'}
                                            className="text-xs"
                                        >
                                            {getPerformanceStatus(performance.cpu)}
                                        </Badge>
                                    </div>
                                </div>
                                <Progress value={performance.cpu} className="h-2" />
                            </div>

                            {/* Memory Usage */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CircuitryIcon className="h-4 w-4" />
                                        <span className="font-medium">Memory Usage</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-semibold ${getPerformanceColor(performance.memory)}`}>
                                            {performance.memory}%
                                        </span>
                                        <Badge
                                            variant={performance.memory >= 90 ? 'destructive' : performance.memory >= 70 ? 'outline' : 'default'}
                                            className="text-xs"
                                        >
                                            {getPerformanceStatus(performance.memory)}
                                        </Badge>
                                    </div>
                                </div>
                                <Progress value={performance.memory} className="h-2" />
                            </div>

                            {/* Disk Usage */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CircuitryIcon className="h-4 w-4" />
                                        <span className="font-medium">Disk Usage</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-semibold ${getPerformanceColor(performance.disk)}`}>
                                            {performance.disk}%
                                        </span>
                                        <Badge
                                            variant={performance.disk >= 90 ? 'destructive' : performance.disk >= 70 ? 'outline' : 'default'}
                                            className="text-xs"
                                        >
                                            {getPerformanceStatus(performance.disk)}
                                        </Badge>
                                    </div>
                                </div>
                                <Progress value={performance.disk} className="h-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Last Backup Info */}
            {healthData?.lastBackup && (
                <Card>
                    <CardHeader>
                        <CardTitle>Backup Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                            <span>Last backup: {new Date(healthData.lastBackup).toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
