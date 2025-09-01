import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    StethoscopeIcon,
    PillIcon,
    TestTubeIcon,
    CalendarIcon,
    TrendUpIcon,
    TrendDownIcon,
    HeartIcon,
    WarningIcon,
    ClockIcon,
    ActivityIcon
} from '@phosphor-icons/react';

interface MedicalStatisticsData {
    totalRecords: number;
    totalMedications: number;
    totalLabTests: number;
    totalVisits: number;
    lastVisit?: string;
    avgVisitsPerMonth: number;
    commonDiagnoses: Array<{
        diagnosis: string;
        count: number;
        percentage: number;
    }>;
    recentTrends: {
        recordsThisMonth: number;
        recordsLastMonth: number;
        medicationsActive: number;
        criticalAlerts: number;
        pendingFollowUps: number;
    };
    vitalsTrends: {
        averageHeartRate: number;
        averageBloodPressure: string;
        averageTemperature: number;
        trends: {
            heartRate: 'up' | 'down' | 'stable';
            bloodPressure: 'up' | 'down' | 'stable';
            temperature: 'up' | 'down' | 'stable';
        };
    };
}

interface MedicalStatisticsProps {
    data: MedicalStatisticsData;
    className?: string;
    compactMode?: boolean;
}

export function MedicalStatistics({ data, className, compactMode = false }: MedicalStatisticsProps) {
    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return 'Unknown';
        }
    };

    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up':
                return <TrendUpIcon size={16} className="text-red-500" />;
            case 'down':
                return <TrendDownIcon size={16} className="text-green-500" />;
            default:
                return <ActivityIcon size={16} className="text-gray-500" />;
        }
    };

    const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up':
                return 'text-red-600';
            case 'down':
                return 'text-green-600';
            default:
                return 'text-gray-600';
        }
    };

    const getRecordsTrend = () => {
        const current = data.recentTrends.recordsThisMonth;
        const previous = data.recentTrends.recordsLastMonth;

        if (current > previous) return 'up';
        if (current < previous) return 'down';
        return 'stable';
    };

    const getRecordsTrendPercentage = () => {
        const current = data.recentTrends.recordsThisMonth;
        const previous = data.recentTrends.recordsLastMonth;

        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    };

    if (compactMode) {
        return (
            <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 ${className}`}>
                {/* Total Records */}
                <Card>
                    <CardContent className="p-4 text-center">
                        <StethoscopeIcon size={24} className="mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl font-bold">{data.totalRecords}</div>
                        <div className="text-sm text-muted-foreground">Records</div>
                    </CardContent>
                </Card>

                {/* Active Medications */}
                <Card>
                    <CardContent className="p-4 text-center">
                        <PillIcon size={24} className="mx-auto mb-2 text-green-600" />
                        <div className="text-2xl font-bold">{data.recentTrends.medicationsActive}</div>
                        <div className="text-sm text-muted-foreground">Active Meds</div>
                    </CardContent>
                </Card>

                {/* Lab Tests */}
                <Card>
                    <CardContent className="p-4 text-center">
                        <TestTubeIcon size={24} className="mx-auto mb-2 text-purple-600" />
                        <div className="text-2xl font-bold">{data.totalLabTests}</div>
                        <div className="text-sm text-muted-foreground">Lab Tests</div>
                    </CardContent>
                </Card>

                {/* Critical Alerts */}
                <Card>
                    <CardContent className="p-4 text-center">
                        <WarningIcon size={24} className="mx-auto mb-2 text-red-600" />
                        <div className="text-2xl font-bold">{data.recentTrends.criticalAlerts}</div>
                        <div className="text-sm text-muted-foreground">Alerts</div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Overview Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Medical Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {/* Total Records */}
                        <div className="text-center">
                            <div className="flex justify-center mb-2">
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <StethoscopeIcon size={24} className="text-blue-600" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-blue-600">{data.totalRecords}</div>
                            <div className="text-sm text-muted-foreground">Total Records</div>
                            <div className="flex items-center justify-center gap-1 mt-1">
                                {getTrendIcon(getRecordsTrend())}
                                <span className={`text-xs ${getTrendColor(getRecordsTrend())}`}>
                                    {Math.abs(getRecordsTrendPercentage())}% this month
                                </span>
                            </div>
                        </div>

                        {/* Total Medications */}
                        <div className="text-center">
                            <div className="flex justify-center mb-2">
                                <div className="p-3 bg-green-100 rounded-full">
                                    <PillIcon size={24} className="text-green-600" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-green-600">{data.totalMedications}</div>
                            <div className="text-sm text-muted-foreground">Total Medications</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {data.recentTrends.medicationsActive} currently active
                            </div>
                        </div>

                        {/* Lab Tests */}
                        <div className="text-center">
                            <div className="flex justify-center mb-2">
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <TestTubeIcon size={24} className="text-purple-600" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-purple-600">{data.totalLabTests}</div>
                            <div className="text-sm text-muted-foreground">Lab Tests</div>
                        </div>

                        {/* Visit Frequency */}
                        <div className="text-center">
                            <div className="flex justify-center mb-2">
                                <div className="p-3 bg-orange-100 rounded-full">
                                    <CalendarIcon size={24} className="text-orange-600" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-orange-600">{data.avgVisitsPerMonth.toFixed(1)}</div>
                            <div className="text-sm text-muted-foreground">Visits/Month</div>
                            {data.lastVisit && (
                                <div className="text-xs text-muted-foreground mt-1">
                                    Last: {formatDate(data.lastVisit)}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Vital Signs Trends */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Vital Signs Trends</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Heart Rate */}
                        <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
                            <HeartIcon size={32} className="text-red-600" />
                            <div className="flex-1">
                                <div className="text-lg font-semibold">
                                    {data.vitalsTrends.averageHeartRate} bpm
                                </div>
                                <div className="text-sm text-muted-foreground">Average Heart Rate</div>
                                <div className="flex items-center gap-1 mt-1">
                                    {getTrendIcon(data.vitalsTrends.trends.heartRate)}
                                    <span className={`text-xs ${getTrendColor(data.vitalsTrends.trends.heartRate)}`}>
                                        {data.vitalsTrends.trends.heartRate} trend
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Blood Pressure */}
                        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <ActivityIcon size={32} className="text-blue-600" />
                            <div className="flex-1">
                                <div className="text-lg font-semibold">
                                    {data.vitalsTrends.averageBloodPressure}
                                </div>
                                <div className="text-sm text-muted-foreground">Average Blood Pressure</div>
                                <div className="flex items-center gap-1 mt-1">
                                    {getTrendIcon(data.vitalsTrends.trends.bloodPressure)}
                                    <span className={`text-xs ${getTrendColor(data.vitalsTrends.trends.bloodPressure)}`}>
                                        {data.vitalsTrends.trends.bloodPressure} trend
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Temperature */}
                        <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <ActivityIcon size={32} className="text-yellow-600" />
                            <div className="flex-1">
                                <div className="text-lg font-semibold">
                                    {data.vitalsTrends.averageTemperature}°C
                                </div>
                                <div className="text-sm text-muted-foreground">Average Temperature</div>
                                <div className="flex items-center gap-1 mt-1">
                                    {getTrendIcon(data.vitalsTrends.trends.temperature)}
                                    <span className={`text-xs ${getTrendColor(data.vitalsTrends.trends.temperature)}`}>
                                        {data.vitalsTrends.trends.temperature} trend
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Alerts and Follow-ups */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <WarningIcon size={20} className="text-red-600" />
                            Active Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Critical Alerts</span>
                                <Badge variant={data.recentTrends.criticalAlerts > 0 ? "destructive" : "secondary"}>
                                    {data.recentTrends.criticalAlerts}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Pending Follow-ups</span>
                                <Badge variant={data.recentTrends.pendingFollowUps > 0 ? "secondary" : "outline"}>
                                    {data.recentTrends.pendingFollowUps}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Active Medications</span>
                                <Badge variant="outline">
                                    {data.recentTrends.medicationsActive}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Common Diagnoses */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Common Diagnoses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.commonDiagnoses.slice(0, 5).map((diagnosis, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <div>
                                        <div className="text-sm font-medium">{diagnosis.diagnosis}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {diagnosis.count} occurrence{diagnosis.count !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                    <Badge variant="outline">
                                        {diagnosis.percentage.toFixed(1)}%
                                    </Badge>
                                </div>
                            ))}
                            {data.commonDiagnoses.length === 0 && (
                                <div className="text-center text-muted-foreground py-4">
                                    <StethoscopeIcon size={32} className="mx-auto mb-2" />
                                    <p className="text-sm">No diagnoses recorded yet</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <ClockIcon size={20} />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {data.recentTrends.recordsThisMonth}
                            </div>
                            <div className="text-sm text-muted-foreground">Records This Month</div>
                            <div className="flex items-center justify-center gap-1 mt-1">
                                {getTrendIcon(getRecordsTrend())}
                                <span className={`text-xs ${getTrendColor(getRecordsTrend())}`}>
                                    vs {data.recentTrends.recordsLastMonth} last month
                                </span>
                            </div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {data.totalVisits}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Visits</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {data.avgVisitsPerMonth.toFixed(1)} per month average
                            </div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                                {data.totalLabTests}
                            </div>
                            <div className="text-sm text-muted-foreground">Lab Tests Completed</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
