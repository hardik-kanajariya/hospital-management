import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    HeartIcon,
    ThermometerIcon,
    ActivityIcon,
    DropIcon,
    ScalesIcon,
    RulerIcon,
    WarningIcon
} from '@phosphor-icons/react';

interface VitalSigns {
    temperature: string;
    blood_pressure: string;
    heart_rate: string;
    respiratory_rate: string;
    oxygen_saturation: string;
    weight: string;
    height: string;
}

interface VitalSignsDisplayProps {
    vitalSigns: VitalSigns;
    timestamp?: string;
    className?: string;
    showTrends?: boolean;
    compactMode?: boolean;
}

interface VitalSignMetric {
    label: string;
    value: string;
    unit: string;
    icon: React.ReactNode;
    normalRange: string;
    status: 'normal' | 'warning' | 'critical';
    percentage?: number;
}

export function VitalSignsDisplay({
    vitalSigns,
    timestamp,
    className,
    showTrends = false,
    compactMode = false
}: VitalSignsDisplayProps) {

    const analyzeVitalSign = (type: string, value: string): { status: 'normal' | 'warning' | 'critical', percentage?: number } => {
        const numValue = parseFloat(value);

        switch (type) {
            case 'temperature':
                if (numValue < 35.0) return { status: 'critical' };
                if (numValue < 36.1 || numValue > 37.8) return { status: 'warning' };
                if (numValue > 39.0) return { status: 'critical' };
                return { status: 'normal', percentage: Math.min(100, ((numValue - 35) / (40 - 35)) * 100) };

            case 'systolic':
                if (numValue < 70 || numValue > 180) return { status: 'critical' };
                if (numValue < 90 || numValue > 140) return { status: 'warning' };
                return { status: 'normal', percentage: Math.min(100, ((numValue - 60) / (160 - 60)) * 100) };

            case 'diastolic':
                if (numValue < 40 || numValue > 110) return { status: 'critical' };
                if (numValue < 60 || numValue > 90) return { status: 'warning' };
                return { status: 'normal', percentage: Math.min(100, ((numValue - 40) / (100 - 40)) * 100) };

            case 'heart_rate':
                if (numValue < 40 || numValue > 150) return { status: 'critical' };
                if (numValue < 60 || numValue > 100) return { status: 'warning' };
                return { status: 'normal', percentage: Math.min(100, ((numValue - 40) / (140 - 40)) * 100) };

            case 'respiratory_rate':
                if (numValue < 8 || numValue > 30) return { status: 'critical' };
                if (numValue < 12 || numValue > 20) return { status: 'warning' };
                return { status: 'normal', percentage: Math.min(100, ((numValue - 8) / (25 - 8)) * 100) };

            case 'oxygen_saturation':
                if (numValue < 90) return { status: 'critical' };
                if (numValue < 95) return { status: 'warning' };
                return { status: 'normal', percentage: Math.min(100, ((numValue - 85) / (100 - 85)) * 100) };

            default:
                return { status: 'normal' };
        }
    };

    const getStatusColor = (status: 'normal' | 'warning' | 'critical') => {
        switch (status) {
            case 'critical':
                return 'text-red-600 border-red-200 bg-red-50';
            case 'warning':
                return 'text-yellow-600 border-yellow-200 bg-yellow-50';
            default:
                return 'text-green-600 border-green-200 bg-green-50';
        }
    };

    const getProgressColor = (status: 'normal' | 'warning' | 'critical') => {
        switch (status) {
            case 'critical':
                return 'bg-red-500';
            case 'warning':
                return 'bg-yellow-500';
            default:
                return 'bg-green-500';
        }
    };

    const parseBloodPressure = (bp: string) => {
        const [systolic, diastolic] = bp.split('/').map(Number);
        return { systolic, diastolic };
    };

    const createVitalMetrics = (): VitalSignMetric[] => {
        const metrics: VitalSignMetric[] = [];

        // Temperature
        if (vitalSigns.temperature) {
            const tempAnalysis = analyzeVitalSign('temperature', vitalSigns.temperature);
            metrics.push({
                label: 'Temperature',
                value: vitalSigns.temperature,
                unit: '°C',
                icon: <ThermometerIcon size={20} />,
                normalRange: '36.1-37.2°C',
                status: tempAnalysis.status,
                percentage: tempAnalysis.percentage
            });
        }

        // Blood Pressure
        if (vitalSigns.blood_pressure) {
            const { systolic, diastolic } = parseBloodPressure(vitalSigns.blood_pressure);
            const systolicAnalysis = analyzeVitalSign('systolic', systolic.toString());
            const diastolicAnalysis = analyzeVitalSign('diastolic', diastolic.toString());
            const worstStatus = systolicAnalysis.status === 'critical' || diastolicAnalysis.status === 'critical'
                ? 'critical'
                : systolicAnalysis.status === 'warning' || diastolicAnalysis.status === 'warning'
                    ? 'warning'
                    : 'normal';

            metrics.push({
                label: 'Blood Pressure',
                value: vitalSigns.blood_pressure,
                unit: 'mmHg',
                icon: <ActivityIcon size={20} />,
                normalRange: '90-140/60-90',
                status: worstStatus,
                percentage: systolicAnalysis.percentage
            });
        }

        // Heart Rate
        if (vitalSigns.heart_rate) {
            const hrAnalysis = analyzeVitalSign('heart_rate', vitalSigns.heart_rate);
            metrics.push({
                label: 'Heart Rate',
                value: vitalSigns.heart_rate,
                unit: 'bpm',
                icon: <HeartIcon size={20} />,
                normalRange: '60-100 bpm',
                status: hrAnalysis.status,
                percentage: hrAnalysis.percentage
            });
        }

        // Respiratory Rate
        if (vitalSigns.respiratory_rate) {
            const rrAnalysis = analyzeVitalSign('respiratory_rate', vitalSigns.respiratory_rate);
            metrics.push({
                label: 'Respiratory Rate',
                value: vitalSigns.respiratory_rate,
                unit: '/min',
                icon: <ActivityIcon size={20} />,
                normalRange: '12-20/min',
                status: rrAnalysis.status,
                percentage: rrAnalysis.percentage
            });
        }

        // Oxygen Saturation
        if (vitalSigns.oxygen_saturation) {
            const o2Analysis = analyzeVitalSign('oxygen_saturation', vitalSigns.oxygen_saturation);
            metrics.push({
                label: 'Oxygen Saturation',
                value: vitalSigns.oxygen_saturation,
                unit: '%',
                icon: <DropIcon size={20} />,
                normalRange: '95-100%',
                status: o2Analysis.status,
                percentage: o2Analysis.percentage
            });
        }

        return metrics;
    };

    const vitalMetrics = createVitalMetrics();
    const criticalCount = vitalMetrics.filter(m => m.status === 'critical').length;
    const warningCount = vitalMetrics.filter(m => m.status === 'warning').length;

    if (compactMode) {
        return (
            <Card className={className}>
                <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-sm">Vital Signs</h3>
                        {(criticalCount > 0 || warningCount > 0) && (
                            <div className="flex gap-1">
                                {criticalCount > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                        {criticalCount} Critical
                                    </Badge>
                                )}
                                {warningCount > 0 && (
                                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                        {warningCount} Warning
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {vitalMetrics.map((metric, index) => (
                            <div key={index} className={`text-center p-2 rounded border ${getStatusColor(metric.status)}`}>
                                <div className="flex justify-center mb-1">{metric.icon}</div>
                                <div className="text-lg font-semibold">{metric.value}{metric.unit}</div>
                                <div className="text-xs text-muted-foreground">{metric.label}</div>
                            </div>
                        ))}
                    </div>
                    {/* Weight and Height */}
                    {(vitalSigns.weight || vitalSigns.height) && (
                        <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-3 text-sm">
                            {vitalSigns.weight && (
                                <div className="flex items-center gap-2">
                                    <ScalesIcon size={16} />
                                    <span className="text-muted-foreground">Weight:</span>
                                    <span className="font-medium">{vitalSigns.weight} kg</span>
                                </div>
                            )}
                            {vitalSigns.height && (
                                <div className="flex items-center gap-2">
                                    <RulerIcon size={16} />
                                    <span className="text-muted-foreground">Height:</span>
                                    <span className="font-medium">{vitalSigns.height} cm</span>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold">Vital Signs</CardTitle>
                    <div className="flex items-center gap-2">
                        {criticalCount > 0 && (
                            <Badge variant="destructive">
                                <WarningIcon size={14} className="mr-1" />
                                {criticalCount} Critical
                            </Badge>
                        )}
                        {warningCount > 0 && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                <WarningIcon size={14} className="mr-1" />
                                {warningCount} Warning
                            </Badge>
                        )}
                        {timestamp && (
                            <Badge variant="outline" className="text-xs">
                                {new Date(timestamp).toLocaleString()}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Primary Vital Signs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vitalMetrics.map((metric, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${getStatusColor(metric.status)}`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {metric.icon}
                                    <span className="font-medium text-sm">{metric.label}</span>
                                </div>
                                {metric.status !== 'normal' && (
                                    <WarningIcon size={16} className="text-current" />
                                )}
                            </div>
                            <div className="text-2xl font-bold mb-1">
                                {metric.value}{metric.unit}
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                                Normal: {metric.normalRange}
                            </div>
                            {showTrends && metric.percentage && (
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span>Range Position</span>
                                        <span>{metric.percentage.toFixed(0)}%</span>
                                    </div>
                                    <Progress
                                        value={metric.percentage}
                                        className="h-2"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Body Measurements */}
                {(vitalSigns.weight || vitalSigns.height) && (
                    <div className="pt-4 border-t">
                        <h4 className="font-medium text-sm mb-3">Body Measurements</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {vitalSigns.weight && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <ScalesIcon size={24} className="text-muted-foreground" />
                                    <div>
                                        <div className="font-semibold">{vitalSigns.weight} kg</div>
                                        <div className="text-sm text-muted-foreground">Weight</div>
                                    </div>
                                </div>
                            )}
                            {vitalSigns.height && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <RulerIcon size={24} className="text-muted-foreground" />
                                    <div>
                                        <div className="font-semibold">{vitalSigns.height} cm</div>
                                        <div className="text-sm text-muted-foreground">Height</div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Calculate BMI if both weight and height are available */}
                        {vitalSigns.weight && vitalSigns.height && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2">
                                    <ActivityIcon size={20} className="text-blue-600" />
                                    <div>
                                        <div className="font-semibold text-blue-800">
                                            BMI: {(parseFloat(vitalSigns.weight) / Math.pow(parseFloat(vitalSigns.height) / 100, 2)).toFixed(1)}
                                        </div>
                                        <div className="text-sm text-blue-600">Body Mass Index</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
