import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Calendar, CalendarPlus, Search, Clock, User, FileText, Bell, Phone, Mail } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useNotifications } from '@/hooks/useNotifications'
import { Appointment, Patient } from '@/types/hospital'

const doctors = [
  'Dr. Priya Sharma - Pediatrician',
  'Dr. Rajesh Kumar - General Medicine',
  'Dr. Anita Singh - Gynecologist',
  'Dr. Vikram Patel - Orthopedic',
  'Dr. Meera Joshi - Dermatologist'
]

const appointmentTypes = [
  'Consultation',
  'Follow-up',
  'Vaccination',
  'Health Checkup',
  'Emergency',
  'Surgery Consultation'
]

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
]

export default function AppointmentScheduling() {
  const [appointments, setAppointments] = useKV<Appointment[]>('hospital-appointments', [])
  const [patients] = useKV<Patient[]>('hospital-patients', [])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Appointment>>({
    status: 'scheduled',
    type: 'consultation'
  })
  const [sendReminder, setSendReminder] = useState(true)
  const { sendAppointmentReminder, isLoading: isNotificationLoading } = useNotifications()
  const [todayAppointments, setTodayAppointments] = useKV<Appointment[]>('today-appointments', [])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('all')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    patientName: '',
    doctor: '',
    type: '',
    date: '',
    time: '',
    notes: ''
  })

  const today = new Date().toISOString().split('T')[0]
  const selectedDateString = selectedDate.toISOString().split('T')[0]

  // Filter appointments based on search and filters
  const filteredAppointments = appointments.filter(appointment => {
    const patient = patients.find(p => p.id === appointment.patientId);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : '';
    
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctorId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.id?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  // Get available time slots for a specific date and doctor
  const getAvailableSlots = (date: string, doctorId: string) => {
    const bookedSlots = appointments
      .filter(apt => apt.appointmentDate === date && apt.doctorId === doctorId && apt.status !== 'cancelled')
      .map(apt => apt.appointmentTime)
    
    return timeSlots.filter(slot => !bookedSlots.includes(slot))
  }

  const handleScheduleAppointment = async () => {
    if (!formData.patientId || !formData.doctorId || !formData.type || 
        !formData.appointmentDate || !formData.appointmentTime) {
      toast.error('Please fill in all required fields')
      return
    }

    const patient = patients.find(p => p.id === formData.patientId);
    if (!patient) {
      toast.error('Patient not found')
      return
    }

    // Check if time slot is already booked
    const bookedSlots = appointments
      .filter(apt => apt.appointmentDate === formData.appointmentDate && 
                     apt.doctorId === formData.doctorId && 
                     apt.status !== 'cancelled')
      .map(apt => apt.appointmentTime)
    
    if (bookedSlots.includes(formData.appointmentTime)) {
      toast.error('This time slot is already booked. Please choose a different time.')
      return
    }

    const appointment: Appointment = {
      id: crypto.randomUUID(),
      patientId: formData.patientId,
      doctorId: formData.doctorId,
      appointmentDate: formData.appointmentDate,
      appointmentTime: formData.appointmentTime,
      duration: formData.duration || 30,
      type: formData.type as any,
      status: 'scheduled',
      reason: formData.reason || '',
      notes: formData.notes,
      reminderSent: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setAppointments(currentAppointments => [...currentAppointments, appointment])

    // Send appointment reminder if enabled
    if (sendReminder) {
      const doctorName = formData.doctorId; // In a real app, you'd look up the doctor name
      await sendAppointmentReminder(
        patient.phoneNumber,
        patient.email,
        {
          doctorName,
          date: new Date(formData.appointmentDate).toLocaleDateString(),
          time: formData.appointmentTime,
          patientName: `${patient.firstName} ${patient.lastName}`
        }
      );
    }

    resetForm()
    setIsDialogOpen(false)
    toast.success(`Appointment scheduled successfully`)
  }

  const resetForm = () => {
    setFormData({
      status: 'scheduled',
      type: 'consultation'
    })
    setSendReminder(true)
  }

  const updateAppointmentStatus = (appointmentId: string, newStatus: Appointment['status']) => {
    setAppointments(currentAppointments =>
      currentAppointments.map(appointment =>
        appointment.id === appointmentId 
          ? { ...appointment, status: newStatus }
          : appointment
      )
    )
    
    // Update today's appointments if needed
    setTodayAppointments(current =>
      current.map(appointment =>
        appointment.id === appointmentId
          ? { ...appointment, status: newStatus }
          : appointment
      )
    )
    
    toast.success(`Appointment status updated to ${newStatus}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="text-blue-600">Scheduled</Badge>
      case 'in-progress':
        return <Badge variant="default" className="bg-yellow-500">In Progress</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const todayStats = {
    total: appointments.filter(apt => apt.date === today).length,
    completed: appointments.filter(apt => apt.date === today && apt.status === 'completed').length,
    inProgress: appointments.filter(apt => apt.date === today && apt.status === 'in-progress').length,
    scheduled: appointments.filter(apt => apt.date === today && apt.status === 'scheduled').length
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="selected">Selected Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <CalendarPlus className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
              <DialogDescription>
                Book an appointment for a patient with available doctors.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Select Patient *</Label>
                <Select
                  value={newAppointment.patientId}
                  onValueChange={(value) => {
                    const patient = patients.find(p => p.id === value)
                    setNewAppointment({
                      ...newAppointment, 
                      patientId: value,
                      patientName: patient?.name || ''
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} - {patient.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor">Select Doctor *</Label>
                  <Select
                    value={newAppointment.doctor}
                    onValueChange={(value) => setNewAppointment({...newAppointment, doctor: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor} value={doctor}>
                          {doctor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Appointment Type *</Label>
                  <Select
                    value={newAppointment.type}
                    onValueChange={(value) => setNewAppointment({...newAppointment, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                    min={today}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Select
                    value={newAppointment.time}
                    onValueChange={(value) => setNewAppointment({...newAppointment, time: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => {
                        const bookedSlots = getBookedSlots(newAppointment.date, newAppointment.doctor)
                        const isBooked = bookedSlots.includes(time)
                        return (
                          <SelectItem key={time} value={time} disabled={isBooked}>
                            {time} {isBooked && '(Booked)'}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  placeholder="Add any special notes or requirements..."
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleScheduleAppointment}>
                Schedule Appointment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Appointments - {today}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{todayStats.total}</div>
              <p className="text-sm text-muted-foreground">Total Appointments</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{todayStats.completed}</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{todayStats.inProgress}</div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{todayStats.scheduled}</div>
              <p className="text-sm text-muted-foreground">Scheduled</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="grid gap-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No appointments found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold">{appointment.patientName}</h3>
                      {getStatusBadge(appointment.status)}
                      <Badge variant="secondary">{appointment.type}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{appointment.doctor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{appointment.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{appointment.time}</span>
                      </div>
                    </div>
                    
                    {appointment.notes && (
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{appointment.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {appointment.status === 'scheduled' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAppointmentStatus(appointment.id, 'in-progress')}
                        >
                          Start
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {appointment.status === 'in-progress' && (
                      <Button
                        size="sm"
                        onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}