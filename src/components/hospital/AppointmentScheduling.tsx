import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
  id: string
  patientName: string
  type: string
  time: string
  notes?: string
}

  'Dr. Priya Sharma - P
  id: string
]
  patientName: string
  'Follow-up',
  type: string
  'Vaccination
  time: string
const timeSlots = [
  notes?: string
]
}

  
  const [selectedDate, setSelectedDate] 
  const [filterStatus, setFilterSt

    patientId: '',
    doctor: '',
]


  const selectedDateStrin
  'Follow-up',
    const matc
                         app
    const matchesSt
    let matchesD
      matchesDate
]

const timeSlots = [
  // Get booked time slots for selected date and doctor
    return appointments
      .map(apt => apt.time)
]

      toast.error('Please fill in all required fi
    }
    // Check if time slot is already booked
    if (bookedSlots.includes(newAppointment.time)) {
  

      id: `APT${Date.now()}`,
      patientName: newAppointment.patientName,
      type: newAppointment.type,
      time: newAppointment.time,

    }
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
            <Button>
          : appointment
       
    )
    
    // Update today's appointments if needed
                Book an appointment
      current.map(appointment =>

          ? { ...appointment, status: newStatus }
          : appointment
      )
     
    
    toast.success(`Appointment status updated to ${newStatus}`)
  }

  const getStatusBadge = (status: string) => {
                    <
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
                      {appointmentTypes.map((type) => (
              className="pl-10"
              
          </div>
          
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                  <Label>Appoin
              </SelectTrigger>
                      <Button
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
                  </Popover>
              <SelectContent>
                <div className="space-y-2">
                <SelectItem value="selected">Selected Date</SelectItem>
                <SelectItem value="all">All Dates</SelectItem>
              </SelectContent>
                    <
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <CalendarPlus className="w-4 h-4 mr-2" />
                          >
            </Button>
                        )
          <DialogContent className="max-w-2xl">
                  </Select
              <DialogTitle>Schedule New Appointment</DialogTitle>

                Book an appointment for a patient with available doctors.
                <Input
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Select Patient *</Label>
            <DialogFoote
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
                        <Badge var
                          Cancell
                      )}
                  </div>
              </Card>
          </div>
      </div>
      {/* Today's Summary */}
        <Card>
            <CardTit

              <div className="text-center">
                  {appointments.filter(apt 
                <p className="text-sm text-muted-foreground">Tota
              <div className="text-center">
                  {appointments.fil
                <p className="text-sm text-muted-foreground">Comple
              <div className="text-c
                  {appointments.fil
                <p className="text-sm text-muted
              <div className="text-center">
                  {appointments.fi
                <p className="text-sm
            </div>
        </Card>
    </div>
}

























































































































































































                      )}

















































                  </div>

              </Card>

          </div>

      </div>

      {/* Today's Summary */}

        <Card>





              <div className="text-center">





              <div className="text-center">





              <div className="text-center">











            </div>

        </Card>

    </div>

}