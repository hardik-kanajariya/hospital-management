import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    CalendarIcon,
    ClockIcon,
    StethoscopeIcon,
    PillIcon,
    TestTubeIcon,
    EyeIcon,
    UserCircleIcon,
    WarningIcon,
    HeartIcon
} from '@phosphor-icons/react';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';

interface TimelineRecord {
    id: string;
    record_id: string;
    visit_date: string;
    diagnosis: string;
    treatment: string;
    medications?: Array<{
        name: string;
        dosage: string;
        frequency: string;
    }>;
    lab_results?: Array<{
        test_name: string;
        result: string;
        status: string;
    }>;
    vital_signs?: {
        temperature?: string;
        blood_pressure?: string;
        heart_rate?: string;
        respiratory_rate?: string;
        oxygen_saturation?: string;
    };
    doctor?: {
        id: string;
        name: string;
        specialization: string;
    };
}

interface MedicalTimelineProps {
    records: TimelineRecord[];
    onViewRecord?: (record: TimelineRecord) => void;
    className?: string;
}

export function MedicalTimeline({ records, onViewRecord, className }: MedicalTimelineProps) {
    const formatTimelineDate = (dateString: string) => {
        if (!dateString) {
            return 'Unknown date';
        }

        const date = new Date(dateString);
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }

        try {
            if (isToday(date)) {
                return `Today, ${format(date, 'h:mm a')}`;
            } else if (isYesterday(date)) {
                return `Yesterday, ${format(date, 'h:mm a')}`;
            } else {
                const daysAgo = differenceInDays(new Date(), date);
                if (daysAgo <= 7) {
                    return `${daysAgo} days ago, ${format(date, 'h:mm a')}`;
                } else {
                    return format(date, 'MMM dd, yyyy h:mm a');
                }
            }
        } catch (error) {
            return 'Invalid date';
        }
    };

    const getRecordSeverity = (record: TimelineRecord) => {
        // Check for critical indicators
        const vitals = record.vital_signs;
        if (vitals) {
            const temp = vitals.temperature ? parseFloat(vitals.temperature) : 0;
            const systolic = vitals.blood_pressure ? parseInt(vitals.blood_pressure.split('/')[0]) : 0;
            const hr = vitals.heart_rate ? parseInt(vitals.heart_rate) : 0;

            if (temp > 38.5 || systolic > 160 || systolic < 80 || hr > 120 || hr < 50) {
                return 'critical';
            } else if (temp > 37.5 || systolic > 140 || systolic < 90 || hr > 100 || hr < 60) {
                return 'warning';
            }
        }

        // Check lab results for abnormal values
        const hasAbnormalLab = record.lab_results?.some(lab => lab.status !== 'normal');
        if (hasAbnormalLab) {
            return 'warning';
        }

        return 'normal';
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'border-red-500 bg-red-50';
            case 'warning':
                return 'border-yellow-500 bg-yellow-50';
            default:
                return 'border-blue-500 bg-blue-50';
        }
    };

    const getSeverityDotColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-500';
            case 'warning':
                return 'bg-yellow-500';
            default:
                return 'bg-blue-500';
        }
    };

    if (records.length === 0) {
        return (
            <div className={`text-center py-8 ${className}`}>
                <StethoscopeIcon size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No Medical Records</h3>
                <p className="text-sm text-muted-foreground">
                    This patient doesn't have any medical records in the timeline yet.
                </p>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted"></div>

                {records.map((record, index) => {
                    const severity = getRecordSeverity(record);
                    const isLast = index === records.length - 1;

                    return (
                        <div key={record.id} className="relative flex gap-4 pb-6">
                            {/* Timeline dot */}
                            <div className="relative z-10 flex items-center justify-center">
                                <div className={`w-3 h-3 rounded-full ${getSeverityDotColor(severity)} border-2 border-white shadow-sm`}></div>
                            </div>

                            {/* Timeline content */}
                            <div className="flex-1 min-w-0">
                                <Card className={`${getSeverityColor(severity)} border-l-4 hover:shadow-md transition-all duration-200`}>
                                    <CardContent className="p-4">
                                        {/* Header */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-semibold text-base">{record.diagnosis}</h3>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                                    <div className="flex items-center gap-1">
                                                        <ClockIcon size={14} />
                                                        {formatTimelineDate(record.visit_date)}
                                                    </div>
                                                    {record.doctor && (
                                                        <div className="flex items-center gap-1">
                                                            <UserCircleIcon size={14} />
                                                            Dr. {record.doctor.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {severity === 'critical' && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        <WarningIcon size={12} className="mr-1" />
                                                        Critical
                                                    </Badge>
                                                )}
                                                {severity === 'warning' && (
                                                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                                        <WarningIcon size={12} className="mr-1" />
                                                        Alert
                                                    </Badge>
                                                )}
                                                <Badge variant="outline" className="text-xs">
                                                    {record.record_id}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Treatment summary */}
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                            {record.treatment}
                                        </p>

                                        {/* Quick metrics */}
                                        <div className="flex flex-wrap gap-3 text-xs mb-3">
                                            {record.medications && record.medications.length > 0 && (
                                                <div className="flex items-center gap-1 text-blue-600">
                                                    <PillIcon size={12} />
                                                    {record.medications.length} med{record.medications.length !== 1 ? 's' : ''}
                                                </div>
                                            )}
                                            {record.lab_results && record.lab_results.length > 0 && (
                                                <div className="flex items-center gap-1 text-green-600">
                                                    <TestTubeIcon size={12} />
                                                    {record.lab_results.length} lab{record.lab_results.length !== 1 ? 's' : ''}
                                                </div>
                                            )}
                                            {record.vital_signs && (
                                                <div className="flex items-center gap-1 text-red-600">
                                                    <HeartIcon size={12} />
                                                    Vitals
                                                </div>
                                            )}
                                        </div>

                                        {/* Key vital signs */}
                                        {record.vital_signs && (
                                            <div className="bg-white bg-opacity-50 rounded p-2 mb-3">
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                                    {record.vital_signs.temperature && (
                                                        <div>
                                                            <span className="text-muted-foreground">Temp:</span>
                                                            <span className="ml-1 font-medium">{record.vital_signs.temperature}°C</span>
                                                        </div>
                                                    )}
                                                    {record.vital_signs.blood_pressure && (
                                                        <div>
                                                            <span className="text-muted-foreground">BP:</span>
                                                            <span className="ml-1 font-medium">{record.vital_signs.blood_pressure}</span>
                                                        </div>
                                                    )}
                                                    {record.vital_signs.heart_rate && (
                                                        <div>
                                                            <span className="text-muted-foreground">HR:</span>
                                                            <span className="ml-1 font-medium">{record.vital_signs.heart_rate} bpm</span>
                                                        </div>
                                                    )}
                                                    {record.vital_signs.oxygen_saturation && (
                                                        <div>
                                                            <span className="text-muted-foreground">O2:</span>
                                                            <span className="ml-1 font-medium">{record.vital_signs.oxygen_saturation}%</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Medications preview */}
                                        {record.medications && record.medications.length > 0 && (
                                            <div className="mb-3">
                                                <div className="text-xs text-muted-foreground mb-1">Medications:</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {record.medications.slice(0, 3).map((med, medIndex) => (
                                                        <Badge key={medIndex} variant="secondary" className="text-xs">
                                                            {med.name} {med.dosage}
                                                        </Badge>
                                                    ))}
                                                    {record.medications.length > 3 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{record.medications.length - 3} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Lab results preview */}
                                        {record.lab_results && record.lab_results.length > 0 && (
                                            <div className="mb-3">
                                                <div className="text-xs text-muted-foreground mb-1">Lab Results:</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {record.lab_results.slice(0, 2).map((lab, labIndex) => (
                                                        <Badge
                                                            key={labIndex}
                                                            variant={lab.status === 'normal' ? 'secondary' : 'destructive'}
                                                            className="text-xs"
                                                        >
                                                            {lab.test_name}: {lab.result}
                                                        </Badge>
                                                    ))}
                                                    {record.lab_results.length > 2 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{record.lab_results.length - 2} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Action button */}
                                        {onViewRecord && (
                                            <div className="flex justify-end">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onViewRecord(record)}
                                                    className="text-xs"
                                                >
                                                    <EyeIcon size={12} className="mr-1" />
                                                    View Details
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
