import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    CalendarIcon,
    ClockIcon,
    UserIcon,
    StethoscopeIcon,
    PhoneIcon,
    MapPinIcon,
    FileTextIcon,
    HeartIcon
} from '@phosphor-icons/react'
import { Appointment } from '@/types/hospital'
import { useDoctorApi } from '@/hooks/useDoctorApi'
import { usePatientApi } from '@/hooks/usePatientApi'

interface AppointmentViewProps {
    appointment: Appointment | null;
}

// Utility functions for formatting
const formatDate = (date: string | null | undefined): string => {
    if (!date) return 'Not specified'
    try {
        return new Date(date).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    } catch {
        return 'Invalid date'
    }
}

const formatTime = (time: string | null | undefined): string => {
    if (!time) return 'Not specified'
    try {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    } catch {
        return time
    }
}

const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'scheduled':
            return 'bg-blue-100 text-blue-800 border-blue-200'
        case 'confirmed':
            return 'bg-green-100 text-green-800 border-green-200'
        case 'completed':
            return 'bg-emerald-100 text-emerald-800 border-emerald-200'
        case 'cancelled':
            return 'bg-red-100 text-red-800 border-red-200'
        case 'in_progress':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'no_show':
            return 'bg-gray-100 text-gray-800 border-gray-200'
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200'
    }
}

const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
        case 'emergency':
            return 'bg-red-100 text-red-800 border-red-200'
        case 'surgery_consultation':
            return 'bg-purple-100 text-purple-800 border-purple-200'
        case 'follow_up':
            return 'bg-orange-100 text-orange-800 border-orange-200'
        case 'vaccination':
            return 'bg-green-100 text-green-800 border-green-200'
        default:
            return 'bg-blue-100 text-blue-800 border-blue-200'
    }
}

export default function AppointmentView({ appointment }: AppointmentViewProps) {
    const { patients } = usePatientApi()
    const { doctors } = useDoctorApi()

    if (!appointment) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No appointment selected</p>
            </div>
        )
    }

    // Get patient details
    const patient = patients.find(p => p.id === appointment.patient_id)

    // Get doctor details
    const doctor = doctors.find(d => d.id === appointment.doctor_id)

    return (
        <div className="space-y-6">
            {/* Appointment Header */}
            <div className="border-b pb-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">Appointment Details</h3>
                    <div className="flex gap-2">
                        <Badge className={getStatusColor(appointment.status || '')}>
                            {appointment.status || 'Scheduled'}
                        </Badge>
                        <Badge className={getTypeColor(appointment.appointment_type || '')} variant="outline">
                            {appointment.appointment_type || 'Consultation'}
                        </Badge>
                    </div>
                </div>
                <div className="text-sm text-muted-foreground">
                    Appointment ID: {appointment.id}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <UserIcon className="w-5 h-5" />
                            Patient Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {patient ? (
                            <>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                                    <p className="font-medium">{patient.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Patient ID</p>
                                    <p className="text-sm">{patient.patient_id}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                    <p className="text-sm flex items-center gap-1">
                                        <PhoneIcon className="w-3 h-3" />
                                        {patient.phone}
                                    </p>
                                </div>
                                {patient.email && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                                        <p className="text-sm">{patient.email}</p>
                                    </div>
                                )}
                                {patient.blood_group && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Blood Group</p>
                                        <p className="text-sm flex items-center gap-1">
                                            <HeartIcon className="w-3 h-3 text-red-500" />
                                            {patient.blood_group}
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">Patient information not available</p>
                        )}
                    </CardContent>
                </Card>

                {/* Doctor Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <StethoscopeIcon className="w-5 h-5" />
                            Doctor Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {doctor ? (
                            <>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                                    <p className="font-medium">Dr. {doctor.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Specialization</p>
                                    <p className="text-sm">{doctor.specialization}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Department</p>
                                    <p className="text-sm">{doctor.department}</p>
                                </div>
                                {doctor.phone_number && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Contact</p>
                                        <p className="text-sm flex items-center gap-1">
                                            <PhoneIcon className="w-3 h-3" />
                                            {doctor.phone_number}
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">Doctor information not available</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Appointment Schedule */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <CalendarIcon className="w-5 h-5" />
                        Schedule Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Date</p>
                            <p className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                {formatDate(appointment.appointment_date)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Time</p>
                            <p className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4 text-muted-foreground" />
                                {formatTime(appointment.appointment_time)}
                            </p>
                        </div>
                        {appointment.duration && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Duration</p>
                                <p className="text-sm">{appointment.duration} minutes</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Appointment Details */}
            {(appointment.reason || appointment.notes) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileTextIcon className="w-5 h-5" />
                            Appointment Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {appointment.reason && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Reason for Visit</p>
                                <p className="text-sm bg-muted p-3 rounded">{appointment.reason}</p>
                            </div>
                        )}
                        {appointment.notes && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Additional Notes</p>
                                <p className="text-sm bg-muted p-3 rounded">{appointment.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Timestamps */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">System Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="font-medium text-muted-foreground mb-1">Created</p>
                            <p>{appointment.created_at ? formatDate(appointment.created_at) : 'Not available'}</p>
                        </div>
                        <div>
                            <p className="font-medium text-muted-foreground mb-1">Last Updated</p>
                            <p>{appointment.updated_at ? formatDate(appointment.updated_at) : 'Not available'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
