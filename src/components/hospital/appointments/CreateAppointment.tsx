import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    CalendarIcon,
    ClockIcon,
    UserIcon,
    StethoscopeIcon,
    XIcon
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Appointment } from '@/types/hospital'
import { useAppointmentApi } from '@/hooks/useAppointmentApi'
import { useDoctorApi } from '@/hooks/useDoctorApi'
import { usePatientApi } from '@/hooks/usePatientApi'

interface CreateAppointmentProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    preSelectedPatientId?: string;
}

const appointmentTypes = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'follow_up', label: 'Follow-up' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'vaccination', label: 'Vaccination' },
    { value: 'checkup', label: 'Health Checkup' },
    { value: 'surgery_consultation', label: 'Surgery Consultation' }
]

const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
]

export default function CreateAppointment({ onSuccess, onCancel, preSelectedPatientId }: CreateAppointmentProps) {
    const { createAppointment, loading } = useAppointmentApi()
    const { patients } = usePatientApi()
    const { doctors } = useDoctorApi()

    const [formData, setFormData] = useState<Partial<Appointment>>({
        patient_id: preSelectedPatientId || '',
        doctor_id: '',
        appointment_date: '',
        appointment_time: '',
        appointment_type: 'consultation',
        status: 'scheduled',
        reason: '',
        notes: ''
    })

    const [selectedDate, setSelectedDate] = useState('')

    // Get available time slots for selected doctor and date
    const getAvailableSlots = () => {
        // TODO: Filter based on doctor availability and existing appointments
        return timeSlots
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.patient_id || !formData.doctor_id || !formData.appointment_date || !formData.appointment_time) {
            toast.error('Please fill in all required fields')
            return
        }

        try {
            const selectedDoctor = doctors.find(d => d.id === formData.doctor_id)

            const appointmentData = {
                ...formData,
                doctor_name: selectedDoctor?.name || 'Unknown Doctor'
            }

            await createAppointment(appointmentData)
            toast.success('Appointment scheduled successfully')
            onSuccess?.()
        } catch (error) {
            toast.error('Failed to schedule appointment')
        }
    }

    const handleCancel = () => {
        setFormData({
            patient_id: preSelectedPatientId || '',
            doctor_id: '',
            appointment_date: '',
            appointment_time: '',
            appointment_type: 'consultation',
            status: 'scheduled',
            reason: '',
            notes: ''
        })
        onCancel?.()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Selection */}
                <div className="space-y-2">
                    <Label htmlFor="patient_id" className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        Patient *
                    </Label>
                    <Select
                        value={formData.patient_id}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, patient_id: value }))}
                        required
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                        <SelectContent>
                            {patients.map((patient) => (
                                <SelectItem key={patient.id} value={patient.id}>
                                    {patient.name} ({patient.patient_id})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Doctor Selection */}
                <div className="space-y-2">
                    <Label htmlFor="doctor_id" className="flex items-center gap-2">
                        <StethoscopeIcon className="w-4 h-4" />
                        Doctor *
                    </Label>
                    <Select
                        value={formData.doctor_id}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, doctor_id: value }))}
                        required
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a doctor" />
                        </SelectTrigger>
                        <SelectContent>
                            {doctors.map((doctor) => (
                                <SelectItem key={doctor.id} value={doctor.id}>
                                    Dr. {doctor.name} - {doctor.specialization}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Appointment Date */}
                <div className="space-y-2">
                    <Label htmlFor="appointment_date" className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        Appointment Date *
                    </Label>
                    <Input
                        type="date"
                        value={formData.appointment_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, appointment_date: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        required
                    />
                </div>

                {/* Appointment Time */}
                <div className="space-y-2">
                    <Label htmlFor="appointment_time" className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4" />
                        Appointment Time *
                    </Label>
                    <Select
                        value={formData.appointment_time}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, appointment_time: value }))}
                        required
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent>
                            {getAvailableSlots().map((slot) => (
                                <SelectItem key={slot} value={slot}>
                                    {new Date(`2000-01-01T${slot}`).toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Appointment Type */}
                <div className="space-y-2">
                    <Label htmlFor="appointment_type">Appointment Type *</Label>
                    <Select
                        value={formData.appointment_type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, appointment_type: value as any }))}
                        required
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select appointment type" />
                        </SelectTrigger>
                        <SelectContent>
                            {appointmentTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="no_show">No Show</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
                <Label htmlFor="reason">Reason for Visit</Label>
                <Textarea
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Brief description of the reason for this appointment"
                    rows={3}
                />
            </div>

            {/* Notes */}
            <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional notes or special instructions"
                    rows={3}
                />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleCancel}>
                    <XIcon className="w-4 h-4 mr-2" />
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Scheduling...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            Schedule Appointment
                        </div>
                    )}
                </Button>
            </div>
        </form>
    )
}
