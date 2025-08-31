import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
    CalendarIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    ClockIcon,
    UserIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Appointment } from '@/types/hospital'
import { Patient } from '@/types/patient'
import CreateAppointment from './CreateAppointment'
import EditAppointment from './EditAppointment'
import AppointmentView from './AppointmentView'
import { useAppointmentApi } from '@/hooks/useAppointmentApi'
import { usePatientApi } from '@/hooks/usePatientApi'

// Utility functions for formatting
const formatDate = (date: string | null | undefined): string => {
    if (!date) return 'Not specified'
    try {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
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
        case 'completed':
            return 'bg-green-100 text-green-800 border-green-200'
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

export default function AppointmentList() {
    const navigate = useNavigate()
    const { appointments, deleteAppointment, loading } = useAppointmentApi()
    const { patients } = usePatientApi()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [dateFilter, setDateFilter] = useState('all')
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showViewDialog, setShowViewDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    // Get patient name by ID
    const getPatientName = (patientId: string): string => {
        const patient = patients.find(p => p.id === patientId)
        if (!patient) return 'Unknown Patient'
        return patient.name || 'Unknown Patient'
    }

    // Filter appointments
    const filteredAppointments = appointments?.filter(appointment => {
        const patientName = getPatientName(appointment.patient_id || '')
        const matchesSearch =
            patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.appointment_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter

        const today = new Date()
        const appointmentDate = new Date(appointment.appointment_date || '')
        let matchesDate = true

        if (dateFilter === 'today') {
            matchesDate = appointmentDate.toDateString() === today.toDateString()
        } else if (dateFilter === 'week') {
            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
            matchesDate = appointmentDate >= today && appointmentDate <= weekFromNow
        } else if (dateFilter === 'month') {
            const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
            matchesDate = appointmentDate >= today && appointmentDate <= monthFromNow
        }

        return matchesSearch && matchesStatus && matchesDate
    }) || []

    const handleDeleteAppointment = async () => {
        if (!selectedAppointment?.id) return

        try {
            await deleteAppointment(selectedAppointment.id)
            toast.success('Appointment deleted successfully')
            setShowDeleteDialog(false)
            setSelectedAppointment(null)
        } catch (error) {
            toast.error('Failed to delete appointment')
        }
    }

    const handleViewAppointment = (appointment) => {
        setSelectedAppointment(appointment)
        setShowViewDialog(true)
    }

    const handleEditAppointment = (appointment) => {
        setSelectedAppointment(appointment)
        setShowEditDialog(true)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading appointments...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Appointments</h1>
                    <p className="text-muted-foreground">Manage patient appointments and schedules</p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
                    <PlusIcon className="w-4 h-4" />
                    Schedule Appointment
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Search & Filter</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search by patient name, doctor, or appointment type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="no_show">No Show</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Date" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Dates</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Appointments Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5" />
                        Appointments ({filteredAppointments.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredAppointments.length === 0 ? (
                        <div className="text-center py-8">
                            <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-medium mb-2">No appointments found</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                                    ? 'Try adjusting your search criteria'
                                    : 'Schedule your first appointment to get started'
                                }
                            </p>
                            <Button onClick={() => setShowCreateDialog(true)}>
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Schedule Appointment
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAppointments.map((appointment) => (
                                    <TableRow key={appointment.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <UserIcon className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">{getPatientName(appointment.patient_id || '')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{appointment.doctor_name || 'Not assigned'}</TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1">
                                                    <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                                                    <span className="text-sm">{formatDate(appointment.appointment_date)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <ClockIcon className="w-3 h-3 text-muted-foreground" />
                                                    <span className="text-sm">{formatTime(appointment.appointment_time)}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {appointment.appointment_type || 'Consultation'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(appointment.status || '')}>
                                                {appointment.status || 'Scheduled'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-48 truncate">
                                            {appointment.reason || 'Regular checkup'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewAppointment(appointment)}
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditAppointment(appointment)}
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedAppointment(appointment)
                                                        setShowDeleteDialog(true)
                                                    }}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Create Appointment Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Schedule New Appointment</DialogTitle>
                        <DialogDescription>
                            Create a new appointment for a patient with available doctors
                        </DialogDescription>
                    </DialogHeader>
                    <CreateAppointment
                        onSuccess={() => setShowCreateDialog(false)}
                        onCancel={() => setShowCreateDialog(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Appointment Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Appointment</DialogTitle>
                        <DialogDescription>
                            Update appointment details and scheduling information
                        </DialogDescription>
                    </DialogHeader>
                    <EditAppointment
                        appointment={selectedAppointment}
                        onSuccess={() => setShowEditDialog(false)}
                        onCancel={() => setShowEditDialog(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* View Appointment Dialog */}
            <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Appointment Details</DialogTitle>
                        <DialogDescription>
                            View complete appointment information
                        </DialogDescription>
                    </DialogHeader>
                    <AppointmentView appointment={selectedAppointment} />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Appointment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this appointment? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteAppointment}>
                            Delete Appointment
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
