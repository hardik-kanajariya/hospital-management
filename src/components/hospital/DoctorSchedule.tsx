import { useState } from 'react'
import { useKV } from '@/hooks/useLocalStorage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  UserCircle,
  Calendar,
  Clock,
  PencilSimple,
  CheckCircle,
  XCircle,
  MapPin,
  Stethoscope,
  CalendarBlank,
} from '@phosphor-icons/react';
import { toast } from 'sonner'

interface Doctor {
  id: string
  name: string
  specialization: string
  phone: string
  email: string
  licenseNumber: string
  experience: number
  consultationFee: number
  department: string
  status: 'active' | 'inactive'
  joiningDate: string
}

interface Schedule {
  id: string
  doctorId: string
  doctorName: string
  dayOfWeek: string
  startTime: string
  endTime: string
  location: string
  maxPatients: number
  status: 'active' | 'inactive'
  type: 'regular' | 'emergency' | 'surgery'
}

interface Availability {
  id: string
  doctorId: string
  date: string
  isAvailable: boolean
  reason?: string
  replacement?: string
}

const specializations = [
  'General Medicine', 'Cardiology', 'Pediatrics', 'Orthopedics',
  'Gynecology', 'Surgery', 'Psychiatry', 'Dermatology', 'Neurology', 'Emergency Medicine'
]

const departments = [
  'Emergency', 'General Medicine', 'Surgery', 'Pediatrics', 'Maternity', 'Orthopedics'
]

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]

export default function DoctorSchedule() {
  const [doctors, setDoctors] = useKV<Doctor[]>('hospital-doctors', [])
  const [schedules, setSchedules] = useKV<Schedule[]>('doctor-schedules', [])
  const [availability, setAvailability] = useKV<Availability[]>('doctor-availability', [])

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [isDoctorDialogOpen, setIsDoctorDialogOpen] = useState(false)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] = useState(false)

  const [doctorFormData, setDoctorFormData] = useState<Partial<Doctor>>({
    status: 'active'
  })

  const [scheduleFormData, setScheduleFormData] = useState<Partial<Schedule>>({
    status: 'active',
    type: 'regular'
  })

  const [availabilityFormData, setAvailabilityFormData] = useState<Partial<Availability>>({
    isAvailable: false
  })

  const handleAddDoctor = () => {
    if (!doctorFormData.name || !doctorFormData.specialization || !doctorFormData.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    const newDoctor: Doctor = {
      id: `DR${Date.now()}`,
      name: doctorFormData.name!,
      specialization: doctorFormData.specialization!,
      phone: doctorFormData.phone!,
      email: doctorFormData.email || '',
      licenseNumber: doctorFormData.licenseNumber || '',
      experience: Number(doctorFormData.experience) || 0,
      consultationFee: Number(doctorFormData.consultationFee) || 0,
      department: doctorFormData.department || '',
      status: doctorFormData.status as 'active' | 'inactive',
      joiningDate: new Date().toISOString().split('T')[0]
    }

    setDoctors(current => [...current, newDoctor])
    setDoctorFormData({ status: 'active' })
    setIsDoctorDialogOpen(false)
    toast.success('Doctor added successfully')
  }

  const handleAddSchedule = () => {
    if (!scheduleFormData.doctorId || !scheduleFormData.dayOfWeek || !scheduleFormData.startTime || !scheduleFormData.endTime) {
      toast.error('Please fill in all required fields')
      return
    }

    const doctor = doctors.find(d => d.id === scheduleFormData.doctorId)
    if (!doctor) {
      toast.error('Doctor not found')
      return
    }

    // Check for schedule conflicts
    const existingSchedule = schedules.find(s =>
      s.doctorId === scheduleFormData.doctorId &&
      s.dayOfWeek === scheduleFormData.dayOfWeek &&
      s.status === 'active' &&
      ((scheduleFormData.startTime! >= s.startTime && scheduleFormData.startTime! < s.endTime) ||
        (scheduleFormData.endTime! > s.startTime && scheduleFormData.endTime! <= s.endTime))
    )

    if (existingSchedule) {
      toast.error('Schedule conflicts with existing schedule')
      return
    }

    const newSchedule: Schedule = {
      id: `SCH${Date.now()}`,
      doctorId: scheduleFormData.doctorId!,
      doctorName: doctor.name,
      dayOfWeek: scheduleFormData.dayOfWeek!,
      startTime: scheduleFormData.startTime!,
      endTime: scheduleFormData.endTime!,
      location: scheduleFormData.location || 'General OPD',
      maxPatients: Number(scheduleFormData.maxPatients) || 20,
      status: scheduleFormData.status as 'active' | 'inactive',
      type: scheduleFormData.type as 'regular' | 'emergency' | 'surgery'
    }

    setSchedules(current => [...current, newSchedule])
    setScheduleFormData({ status: 'active', type: 'regular' })
    setIsScheduleDialogOpen(false)
    toast.success('Schedule added successfully')
  }

  const handleUpdateAvailability = () => {
    if (!availabilityFormData.doctorId || !availabilityFormData.date) {
      toast.error('Please select doctor and date')
      return
    }

    const doctor = doctors.find(d => d.id === availabilityFormData.doctorId)
    if (!doctor) {
      toast.error('Doctor not found')
      return
    }

    // Remove existing availability for same doctor and date
    setAvailability(current =>
      current.filter(a => !(a.doctorId === availabilityFormData.doctorId && a.date === availabilityFormData.date))
    )

    const newAvailability: Availability = {
      id: `AVL${Date.now()}`,
      doctorId: availabilityFormData.doctorId!,
      date: availabilityFormData.date!,
      isAvailable: availabilityFormData.isAvailable!,
      reason: availabilityFormData.reason,
      replacement: availabilityFormData.replacement
    }

    setAvailability(current => [...current, newAvailability])
    setAvailabilityFormData({ isAvailable: false })
    setIsAvailabilityDialogOpen(false)
    toast.success('Availability updated successfully')
  }

  const getSchedulesByDay = (day: string) => {
    return schedules.filter(s => s.dayOfWeek === day && s.status === 'active')
  }

  const getDoctorAvailability = (doctorId: string, date: string) => {
    return availability.find(a => a.doctorId === doctorId && a.date === date)
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Doctor Schedule Management</h3>
          <p className="text-muted-foreground">Manage doctor schedules, availability and shifts</p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isDoctorDialogOpen} onOpenChange={setIsDoctorDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                Add Doctor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Doctor</DialogTitle>
                <DialogDescription>Enter doctor information and credentials</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctorName">Full Name *</Label>
                    <Input
                      id="doctorName"
                      value={doctorFormData.name || ''}
                      onChange={(e) => setDoctorFormData({ ...doctorFormData, name: e.target.value })}
                      placeholder="Dr. John Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization *</Label>
                    <Select value={doctorFormData.specialization} onValueChange={(value) => setDoctorFormData({ ...doctorFormData, specialization: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        {specializations.map((spec) => (
                          <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={doctorFormData.phone || ''}
                      onChange={(e) => setDoctorFormData({ ...doctorFormData, phone: e.target.value })}
                      placeholder="Phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={doctorFormData.email || ''}
                      onChange={(e) => setDoctorFormData({ ...doctorFormData, email: e.target.value })}
                      placeholder="Email address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="license">License Number</Label>
                    <Input
                      id="license"
                      value={doctorFormData.licenseNumber || ''}
                      onChange={(e) => setDoctorFormData({ ...doctorFormData, licenseNumber: e.target.value })}
                      placeholder="Medical license number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience (years)</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={doctorFormData.experience || ''}
                      onChange={(e) => setDoctorFormData({ ...doctorFormData, experience: Number(e.target.value) })}
                      placeholder="Years of experience"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fee">Consultation Fee (₹)</Label>
                    <Input
                      id="fee"
                      type="number"
                      value={doctorFormData.consultationFee || ''}
                      onChange={(e) => setDoctorFormData({ ...doctorFormData, consultationFee: Number(e.target.value) })}
                      placeholder="Consultation fee"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select value={doctorFormData.department} onValueChange={(value) => setDoctorFormData({ ...doctorFormData, department: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDoctorDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddDoctor}>Add Doctor</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Schedule</DialogTitle>
                <DialogDescription>Create a new schedule for a doctor</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduleDoctor">Doctor *</Label>
                  <Select value={scheduleFormData.doctorId} onValueChange={(value) => setScheduleFormData({ ...scheduleFormData, doctorId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.filter(d => d.status === 'active').map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          Dr. {doctor.name} - {doctor.specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dayOfWeek">Day of Week *</Label>
                    <Select value={scheduleFormData.dayOfWeek} onValueChange={(value) => setScheduleFormData({ ...scheduleFormData, dayOfWeek: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {daysOfWeek.map((day) => (
                          <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduleType">Type</Label>
                    <Select value={scheduleFormData.type} onValueChange={(value) => setScheduleFormData({ ...scheduleFormData, type: value as any })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Schedule type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular OPD</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="surgery">Surgery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={scheduleFormData.startTime || ''}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={scheduleFormData.endTime || ''}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={scheduleFormData.location || ''}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, location: e.target.value })}
                      placeholder="Room/Department"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxPatients">Max Patients</Label>
                    <Input
                      id="maxPatients"
                      type="number"
                      value={scheduleFormData.maxPatients || ''}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, maxPatients: Number(e.target.value) })}
                      placeholder="Maximum patients"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddSchedule}>Add Schedule</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAvailabilityDialogOpen} onOpenChange={setIsAvailabilityDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Update Availability
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Availability</DialogTitle>
                <DialogDescription>Mark doctor availability for specific dates</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="availabilityDoctor">Doctor *</Label>
                  <Select value={availabilityFormData.doctorId} onValueChange={(value) => setAvailabilityFormData({ ...availabilityFormData, doctorId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.filter(d => d.status === 'active').map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          Dr. {doctor.name} - {doctor.specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availabilityDate">Date *</Label>
                  <Input
                    id="availabilityDate"
                    type="date"
                    value={availabilityFormData.date || ''}
                    onChange={(e) => setAvailabilityFormData({ ...availabilityFormData, date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isAvailable">Availability Status</Label>
                  <Select
                    value={availabilityFormData.isAvailable ? 'true' : 'false'}
                    onValueChange={(value) => setAvailabilityFormData({ ...availabilityFormData, isAvailable: value === 'true' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Available</SelectItem>
                      <SelectItem value="false">Not Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {!availabilityFormData.isAvailable && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason for Unavailability</Label>
                      <Input
                        id="reason"
                        value={availabilityFormData.reason || ''}
                        onChange={(e) => setAvailabilityFormData({ ...availabilityFormData, reason: e.target.value })}
                        placeholder="Leave, Conference, Emergency, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="replacement">Replacement Doctor</Label>
                      <Select value={availabilityFormData.replacement} onValueChange={(value) => setAvailabilityFormData({ ...availabilityFormData, replacement: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select replacement doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.filter(d => d.status === 'active' && d.id !== availabilityFormData.doctorId).map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.name}>
                              Dr. {doctor.name} - {doctor.specialization}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAvailabilityDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateAvailability}>Update Availability</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctors.filter(d => d.status === 'active').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules.filter(s => s.status === 'active').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {doctors.filter(d => {
                const today = new Date().toISOString().split('T')[0]
                const avail = getDoctorAvailability(d.id, today)
                return avail ? avail.isAvailable : true
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Specializations</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(doctors.map(d => d.specialization)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="doctors">Doctors List</TabsTrigger>
          <TabsTrigger value="availability">Availability Status</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule Overview</CardTitle>
              <CardDescription>Doctor schedules for each day of the week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {daysOfWeek.map((day) => {
                  const daySchedules = getSchedulesByDay(day)
                  return (
                    <div key={day} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <CalendarBlank className="h-4 w-4" />
                        {day}
                        <Badge variant="outline">{daySchedules.length} schedules</Badge>
                      </h3>
                      {daySchedules.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No schedules for this day</p>
                      ) : (
                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                          {daySchedules.map((schedule) => (
                            <div key={schedule.id} className="bg-muted/30 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">Dr. {schedule.doctorName}</h4>
                                <Badge variant={schedule.type === 'emergency' ? 'destructive' : 'secondary'}>
                                  {schedule.type}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {schedule.startTime} - {schedule.endTime}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {schedule.location}
                                </div>
                                <div>Max Patients: {schedule.maxPatients}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="doctors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Doctors Directory</CardTitle>
              <CardDescription>All registered doctors and their information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {doctors.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No doctors registered</h3>
                    <p className="text-muted-foreground">Start by adding your first doctor</p>
                  </div>
                ) : (
                  doctors.map((doctor) => (
                    <div key={doctor.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                          <UserCircle className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium">Dr. {doctor.name}</h3>
                            <Badge variant="outline">{doctor.id}</Badge>
                            <Badge variant={doctor.status === 'active' ? 'default' : 'secondary'}>
                              {doctor.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{doctor.specialization}</span>
                            <span>{doctor.department}</span>
                            <span>₹{doctor.consultationFee}</span>
                            <span>{doctor.experience} years exp.</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <PencilSimple className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Doctor Availability Status</CardTitle>
              <CardDescription>Current availability status for all doctors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {doctors.map((doctor) => {
                  const today = new Date().toISOString().split('T')[0]
                  const todayAvailability = getDoctorAvailability(doctor.id, today)
                  const isAvailable = todayAvailability ? todayAvailability.isAvailable : true

                  return (
                    <div key={doctor.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                          <UserCircle className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-medium">Dr. {doctor.name}</h3>
                          <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isAvailable ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Available</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600">
                            <XCircle className="h-4 w-4" />
                            <div className="text-sm">
                              <span className="font-medium">Not Available</span>
                              {todayAvailability?.reason && (
                                <p className="text-xs">{todayAvailability.reason}</p>
                              )}
                              {todayAvailability?.replacement && (
                                <p className="text-xs">Replacement: {todayAvailability.replacement}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}