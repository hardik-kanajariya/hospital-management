import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'
import {
    CalendarIcon,
    StethoscopeIcon,
    HeartIcon,
    PillIcon,
    TestTubeIcon,
    ActivityIcon,
    PaperclipIcon,
    FileTextIcon,
    EyeIcon,
    PencilIcon,
} from '@phosphor-icons/react'

interface MedicalRecord {
    id: string
    recordId: string
    patientId: string
    doctorId: string
    appointmentId?: string
    visitDate: string
    diagnosis: string
    treatment: string
    medications?: any[]
    labResults?: any[]
    vitalSigns?: Record<string, any>
    notes?: string
    followUpInstructions?: string[]
    nextVisitDate?: string
    attachments?: any[]
    createdAt: string
    updatedAt: string
}

interface MedicalRecordCardProps {
    record: MedicalRecord
    formatDate: (date: string) => string
    showTimeline?: boolean
    index?: number
    totalRecords?: number
    compact?: boolean
}

export function MedicalRecordCard({
    record,
    formatDate,
    showTimeline = false,
    index = 0,
    totalRecords = 1,
    compact = false
}: MedicalRecordCardProps) {
    const navigate = useNavigate()

    if (compact) {
        return (
            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                    {record.recordId}
                                </Badge>
                                <span className="text-sm font-medium">
                                    {formatDate(record.visitDate)}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium">{record.diagnosis}</p>
                                <p className="text-xs text-muted-foreground">{record.treatment}</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>🏥 Dr. {record.doctorId}</span>
                                <span>💊 {record.medications?.length || 0}</span>
                                <span>🧪 {record.labResults?.length || 0}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/medical-records/${record.id}`)}
                            >
                                <EyeIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="relative hover:shadow-md transition-shadow">
            {/* Timeline indicator */}
            {showTimeline && index < totalRecords - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border"></div>
            )}

            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    {/* Timeline dot */}
                    {showTimeline && (
                        <div className="flex-shrink-0 w-3 h-3 bg-primary rounded-full mt-2"></div>
                    )}

                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-xs">
                                        {record.recordId}
                                    </Badge>
                                    <span className="text-sm font-medium">
                                        {formatDate(record.visitDate)}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Doctor ID: {record.doctorId}
                                    {record.appointmentId && ` • Appointment: ${record.appointmentId}`}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate(`/medical-records/${record.id}`)}
                                >
                                    <EyeIcon className="w-4 h-4 mr-1" />
                                    View
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate(`/medical-records/${record.id}/edit`)}
                                >
                                    <PencilIcon className="w-4 h-4 mr-1" />
                                    Edit
                                </Button>
                            </div>
                        </div>

                        {/* Diagnosis & Treatment */}
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <StethoscopeIcon className="w-4 h-4 text-red-500" />
                                    <h5 className="font-medium text-sm">Diagnosis</h5>
                                </div>
                                <p className="text-sm pl-6">{record.diagnosis}</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <HeartIcon className="w-4 h-4 text-blue-500" />
                                    <h5 className="font-medium text-sm">Treatment</h5>
                                </div>
                                <p className="text-sm pl-6">{record.treatment}</p>
                            </div>
                        </div>

                        {/* Quick Info Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {/* Medications */}
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <PillIcon className="w-5 h-5 mx-auto mb-1 text-green-600" />
                                <p className="text-sm font-medium">
                                    {record.medications ? record.medications.length : 0}
                                </p>
                                <p className="text-xs text-muted-foreground">Medications</p>
                            </div>

                            {/* Lab Results */}
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <TestTubeIcon className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                                <p className="text-sm font-medium">
                                    {record.labResults ? record.labResults.length : 0}
                                </p>
                                <p className="text-xs text-muted-foreground">Lab Results</p>
                            </div>

                            {/* Vital Signs */}
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <ActivityIcon className="w-5 h-5 mx-auto mb-1 text-red-600" />
                                <p className="text-sm font-medium">
                                    {record.vitalSigns && Object.keys(record.vitalSigns).length > 0 ? 'Yes' : 'No'}
                                </p>
                                <p className="text-xs text-muted-foreground">Vital Signs</p>
                            </div>

                            {/* Attachments */}
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <PaperclipIcon className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                                <p className="text-sm font-medium">
                                    {record.attachments ? record.attachments.length : 0}
                                </p>
                                <p className="text-xs text-muted-foreground">Attachments</p>
                            </div>
                        </div>

                        {/* Follow-up Instructions */}
                        {record.followUpInstructions && record.followUpInstructions.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4 text-orange-500" />
                                    <h5 className="font-medium text-sm">Follow-up Instructions</h5>
                                </div>
                                <ul className="text-sm pl-6 space-y-1">
                                    {record.followUpInstructions.slice(0, 2).map((instruction: string, idx: number) => (
                                        <li key={idx} className="list-disc">{instruction}</li>
                                    ))}
                                    {record.followUpInstructions.length > 2 && (
                                        <li className="text-muted-foreground">
                                            +{record.followUpInstructions.length - 2} more instructions
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}

                        {/* Next Visit Date */}
                        {record.nextVisitDate && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-800">
                                        Next Visit: {formatDate(record.nextVisitDate)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {record.notes && (
                            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <FileTextIcon className="w-4 h-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <h5 className="font-medium text-sm mb-1">Clinical Notes</h5>
                                        <p className="text-sm text-muted-foreground">{record.notes}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default MedicalRecordCard
