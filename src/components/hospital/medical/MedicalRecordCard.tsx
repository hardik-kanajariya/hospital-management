import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    CalendarIcon,
    UserCircleIcon,
    StethoscopeIcon,
    PillIcon,
    TestTubeIcon,
    EyeIcon,
    PencilIcon,
    ClockIcon,
    ActivityIcon,
    WarningIcon,
    HeartIcon
} from '@phosphor-icons/react';
import { format } from 'date-fns';

interface MedicalRecord {
    id: string;
    record_id: string;
    patient_id: string;
    doctor_id: string;
    visit_date: string;
    diagnosis: string;
    treatment: string;
    medications: Array<{
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions: string;
    }>;
    lab_results: Array<{
        test_name: string;
        result: string;
        normal_range: string;
        status: string;
    }>;
    vital_signs: {
        temperature: string;
        blood_pressure: string;
        heart_rate: string;
        respiratory_rate: string;
        oxygen_saturation: string;
        weight: string;
        height: string;
    };
    follow_up_instructions: string[];
    notes?: string;
    doctor?: {
        id: string;
        name: string;
        specialization: string;
    };
    patient?: {
        id: string;
        name: string;
    };
}

interface MedicalRecordCardProps {
    record: MedicalRecord;
    onView?: (record: MedicalRecord) => void;
    onEdit?: (record: MedicalRecord) => void;
    viewMode?: 'compact' | 'detailed';
    showTimeline?: boolean;
}

export function MedicalRecordCard({
    record,
    onView,
    onEdit,
    viewMode = 'compact',
    showTimeline = false
}: MedicalRecordCardProps) {
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch {
            return dateString;
        }
    };

    const formatTime = (dateString: string) => {
        try {
            return format(new Date(dateString), 'h:mm a');
        } catch {
            return '';
        }
    };

    const getVitalSignsStatus = () => {
        const vitals = record.vital_signs;
        if (!vitals) return null;

        const alerts: string[] = [];

        // Check temperature (normal: 36.1-37.2°C)
        const temp = parseFloat(vitals.temperature);
        if (temp > 37.5) alerts.push('High fever');
        else if (temp > 37.2) alerts.push('Mild fever');
        else if (temp < 36.0) alerts.push('Low temperature');

        // Check blood pressure (normal: 120/80)
        if (vitals.blood_pressure) {
            const [systolic] = vitals.blood_pressure.split('/').map(Number);
            if (systolic > 140) alerts.push('High BP');
            else if (systolic < 90) alerts.push('Low BP');
        }

        // Check heart rate (normal: 60-100 bpm)
        const hr = parseInt(vitals.heart_rate);
        if (hr > 100) alerts.push('High HR');
        else if (hr < 60) alerts.push('Low HR');

        return alerts;
    };

    const vitalSignsAlerts = getVitalSignsStatus();

    if (viewMode === 'compact') {
        return (
            <Card className={`transition-all duration-200 hover:shadow-md ${showTimeline ? 'border-l-4 border-l-blue-500' : ''}`}>
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-lg font-medium">{record.diagnosis}</CardTitle>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center gap-1">
                                    <CalendarIcon size={16} />
                                    {formatDate(record.visit_date)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <ClockIcon size={16} />
                                    {formatTime(record.visit_date)}
                                </div>
                                {record.doctor && (
                                    <div className="flex items-center gap-1">
                                        <UserCircleIcon size={16} />
                                        Dr. {record.doctor.name}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {vitalSignsAlerts && vitalSignsAlerts.length > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                    <WarningIcon size={12} className="mr-1" />
                                    Alerts
                                </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                                {record.record_id}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {/* Treatment Summary */}
                        <div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {record.treatment}
                            </p>
                        </div>

                        {/* Key Metrics */}
                        <div className="flex flex-wrap gap-4 text-xs">
                            {record.medications.length > 0 && (
                                <div className="flex items-center gap-1 text-blue-600">
                                    <PillIcon size={14} />
                                    {record.medications.length} medication{record.medications.length !== 1 ? 's' : ''}
                                </div>
                            )}
                            {record.lab_results.length > 0 && (
                                <div className="flex items-center gap-1 text-green-600">
                                    <TestTubeIcon size={14} />
                                    {record.lab_results.length} lab result{record.lab_results.length !== 1 ? 's' : ''}
                                </div>
                            )}
                            {record.vital_signs && (
                                <div className="flex items-center gap-1 text-red-600">
                                    <HeartIcon size={14} />
                                    Vitals recorded
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 pt-2 border-t">
                            {onView && (
                                <Button variant="outline" size="sm" onClick={() => onView(record)}>
                                    <EyeIcon size={14} className="mr-1" />
                                    View
                                </Button>
                            )}
                            {onEdit && (
                                <Button variant="outline" size="sm" onClick={() => onEdit(record)}>
                                    <PencilIcon size={14} className="mr-1" />
                                    Edit
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Detailed view
    return (
        <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl font-semibold">{record.diagnosis}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                            <div className="flex items-center gap-1">
                                <CalendarIcon size={16} />
                                {formatDate(record.visit_date)} at {formatTime(record.visit_date)}
                            </div>
                            {record.doctor && (
                                <div className="flex items-center gap-1">
                                    <StethoscopeIcon size={16} />
                                    Dr. {record.doctor.name}
                                    {record.doctor.specialization && (
                                        <span className="text-xs">({record.doctor.specialization})</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {vitalSignsAlerts && vitalSignsAlerts.length > 0 && (
                            <Badge variant="destructive">
                                <WarningIcon size={14} className="mr-1" />
                                {vitalSignsAlerts.length} Alert{vitalSignsAlerts.length !== 1 ? 's' : ''}
                            </Badge>
                        )}
                        <Badge variant="secondary">{record.record_id}</Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Treatment */}
                <div>
                    <h4 className="font-medium text-sm mb-2">Treatment Plan</h4>
                    <p className="text-sm text-muted-foreground">{record.treatment}</p>
                </div>

                {/* Vital Signs Alerts */}
                {vitalSignsAlerts && vitalSignsAlerts.length > 0 && (
                    <div>
                        <h4 className="font-medium text-sm mb-2 text-red-600">Vital Signs Alerts</h4>
                        <div className="flex flex-wrap gap-2">
                            {vitalSignsAlerts.map((alert, index) => (
                                <Badge key={index} variant="destructive" className="text-xs">
                                    {alert}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <Separator />

                {/* Medications */}
                {record.medications.length > 0 && (
                    <div>
                        <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                            <PillIcon size={16} />
                            Medications ({record.medications.length})
                        </h4>
                        <div className="space-y-2">
                            {record.medications.slice(0, 3).map((medication, index) => (
                                <div key={index} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-sm">{medication.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {medication.dosage} • {medication.frequency} • {medication.duration}
                                            </p>
                                        </div>
                                    </div>
                                    {medication.instructions && (
                                        <p className="text-xs text-muted-foreground mt-1">{medication.instructions}</p>
                                    )}
                                </div>
                            ))}
                            {record.medications.length > 3 && (
                                <p className="text-xs text-muted-foreground">
                                    +{record.medications.length - 3} more medication{record.medications.length - 3 !== 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Lab Results */}
                {record.lab_results.length > 0 && (
                    <div>
                        <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                            <TestTubeIcon size={16} />
                            Lab Results ({record.lab_results.length})
                        </h4>
                        <div className="space-y-2">
                            {record.lab_results.slice(0, 3).map((result, index) => (
                                <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-sm">{result.test_name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Normal range: {result.normal_range}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-sm">{result.result}</p>
                                            <Badge
                                                variant={result.status === 'normal' ? 'secondary' : 'destructive'}
                                                className="text-xs"
                                            >
                                                {result.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {record.lab_results.length > 3 && (
                                <p className="text-xs text-muted-foreground">
                                    +{record.lab_results.length - 3} more result{record.lab_results.length - 3 !== 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Follow-up Instructions */}
                {record.follow_up_instructions.length > 0 && (
                    <div>
                        <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                            <ActivityIcon size={16} />
                            Follow-up Instructions
                        </h4>
                        <ul className="space-y-1">
                            {record.follow_up_instructions.map((instruction, index) => (
                                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></span>
                                    {instruction}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Notes */}
                {record.notes && (
                    <div>
                        <h4 className="font-medium text-sm mb-2">Additional Notes</h4>
                        <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">{record.notes}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                    {onView && (
                        <Button variant="outline" onClick={() => onView(record)}>
                            <EyeIcon size={16} className="mr-2" />
                            View Details
                        </Button>
                    )}
                    {onEdit && (
                        <Button variant="outline" onClick={() => onEdit(record)}>
                            <PencilIcon size={16} className="mr-2" />
                            Edit Record
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
