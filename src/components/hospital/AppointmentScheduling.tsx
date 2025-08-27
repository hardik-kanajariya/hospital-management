import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, CalendarPlus, Search, Clock, User, FileText } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Appointment {
  id: string
  patientId: string
  patientName: string
  doctor: string
  type: string
  date: string
  time: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  notes?: string
  createdAt: string
}

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
  const [todayAppointments, setTodayAppointments] = useKV<Appointment[]>('today-appointments', [])
  const [patients] = useKV('hospital-patients', [])
  
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
    const matchesSearch = appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.id?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus
    
    let matchesDate = true
    if (filterDate === 'today') {
      matchesDate = appointment.date === today
    } else if (filterDate === 'selected') {
      matchesDate = appointment.date === selectedDateString
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })

  // Get booked time slots for selected date and doctor
  const getBookedSlots = (date: string, doctor: string) => {
    return appointments
      .filter(apt => apt.date === date && apt.doctor === doctor && apt.status !== 'cancelled')
      .map(apt => apt.time)
  }

  const handleScheduleAppointment = () => {
    if (!newAppointment.patientId || !newAppointment.doctor || !newAppointment.type || 
        !newAppointment.date || !newAppointment.time) {
      toast.error('Please fill in all required fields')
      return
    }

    // Check if time slot is already booked
    const bookedSlots = getBookedSlots(newAppointment.date, newAppointment.doctor)
    if (bookedSlots.includes(newAppointment.time)) {
      toast.error('This time slot is already booked. Please choose a different time.')
      return
    }

    const appointment: Appointment = {
      id: `APT${Date.now()}`,
      patientId: newAppointment.patientId,
      patientName: newAppointment.patientName,
      doctor: newAppointment.doctor,
      type: newAppointment.type,
      date: newAppointment.date,
      time: newAppointment.time,
      status: 'scheduled',
      notes: newAppointment.notes,
      createdAt: new Date().toISOString()
    }

    setAppointments(currentAppointments => [...currentAppointments, appointment])
    
    // Update today's appointments if it's for today
    if (newAppointment.date === today) {
      setTodayAppointments(current => [...current, appointment])
    }

    setNewAppointment({
      patientId: '',
      patientName: '',
      doctor: '',
      type: '',
      date: '',
      time: '',
      notes: ''
    })
    setIsDialogOpen(false)
    toast.success(`Appointment scheduled for ${newAppointment.patientName} on ${newAppointment.date} at ${newAppointment.time}`)
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