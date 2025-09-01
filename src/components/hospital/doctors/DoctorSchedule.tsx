import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  UserCircleIcon,
  CalendarIcon,
  ClockIcon,
  PencilSimpleIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  StethoscopeIcon,
  CalendarBlankIcon,
  PlusIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { toast } from 'sonner'
import { useDoctorScheduleApi } from '@/hooks/useDoctorScheduleApi'
import { useMasterDataApi } from '@/hooks/useMasterDataApi'

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]

export default function DoctorSchedule() {
  const navigate = useNavigate()

  const {
    schedules,
    availability,
    doctors,
    loading,
    error,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    upsertAvailability,
    deleteAvailability,
    getSchedulesByDay,
    getDoctorAvailability
  } = useDoctorScheduleApi()

  const {
    getActiveMasterData,
    getMasterDataByCategory
  } = useMasterDataApi()

  // Get dynamic master data
  const [scheduleTypes, setScheduleTypes] = useState<Array<{ value: string; label: string }>>([])
  const [availabilityTypes, setAvailabilityTypes] = useState<Array<{ value: string; label: string }>>([])
  const [locations, setLocations] = useState<Array<{ value: string; label: string }>>([])

  useEffect(() => {
    // Load schedule types
    const scheduleTypesData = getActiveMasterData('schedule_types')
    setScheduleTypes(scheduleTypesData.map(item => ({
      value: item.value || item.name,
      label: item.description || item.name
    })))

    // Load availability types  
    const availabilityTypesData = getActiveMasterData('availability_types')
    setAvailabilityTypes(availabilityTypesData.map(item => ({
      value: item.value || item.name,
      label: item.description || item.name
    })))

    // Load locations
    const locationsData = getActiveMasterData('schedule_locations')
    setLocations(locationsData.map(item => ({
      value: item.value || item.name,
      label: item.description || item.name
    })))
  }, [getActiveMasterData])
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<any>(null)
  const [editingAvailability, setEditingAvailability] = useState<any>(null)

  const [scheduleFormData, setScheduleFormData] = useState<any>({
    status: 'active',
    scheduleType: 'regular',
    slotDurationMinutes: 15,
    maxPatients: 20,
    isRecurring: true,
    priority: 1,
    breakTimes: []
  })

  const [availabilityFormData, setAvailabilityFormData] = useState<any>({
    isAvailable: false,
    availabilityType: 'override',
    notifyPatients: true,
    autoReschedule: false
  })

  const handleAddSchedule = async () => {
    if (!scheduleFormData.userId || !scheduleFormData.dayOfWeek || !scheduleFormData.startTime || !scheduleFormData.endTime) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, scheduleFormData)
        toast.success('Schedule updated successfully')
      } else {
        await createSchedule(scheduleFormData)
        toast.success('Schedule created successfully')
      }

      setScheduleFormData({
        status: 'active',
        scheduleType: 'regular',
        slotDurationMinutes: 15,
        maxPatients: 20,
        isRecurring: true,
        priority: 1,
        breakTimes: []
      })
      setEditingSchedule(null)
      setIsScheduleDialogOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to save schedule')
    }
  }

  const handleEditSchedule = (schedule: any) => {
    setEditingSchedule(schedule)
    setScheduleFormData({
      userId: schedule.userId,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      location: schedule.location,
      maxPatients: schedule.maxPatients,
      slotDurationMinutes: schedule.slotDurationMinutes,
      scheduleType: schedule.scheduleType,
      status: schedule.status,
      notes: schedule.notes || '',
      isRecurring: schedule.isRecurring,
      priority: schedule.priority,
      breakTimes: schedule.breakTimes || []
    })
    setIsScheduleDialogOpen(true)
  }

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await deleteSchedule(scheduleId)
        toast.success('Schedule deleted successfully')
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete schedule')
      }
    }
  }

  const handleUpdateAvailability = async () => {
    if (!availabilityFormData.userId || !availabilityFormData.date) {
      toast.error('Please select doctor and date')
      return
    }

    try {
      if (editingAvailability) {
        await upsertAvailability(availabilityFormData)
        toast.success('Availability updated successfully')
      } else {
        await upsertAvailability(availabilityFormData)
        toast.success('Availability created successfully')
      }

      setAvailabilityFormData({
        isAvailable: false,
        availabilityType: 'override',
        notifyPatients: true,
        autoReschedule: false
      })
      setEditingAvailability(null)
      setIsAvailabilityDialogOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update availability')
    }
  }

  const handleEditAvailability = (availabilityItem: any) => {
    setEditingAvailability(availabilityItem)
    setAvailabilityFormData({
      userId: availabilityItem.userId,
      date: availabilityItem.date,
      isAvailable: availabilityItem.isAvailable,
      availabilityType: availabilityItem.availabilityType,
      reason: availabilityItem.reason || '',
      replacementDoctorId: availabilityItem.replacementDoctorId,
      customStartTime: availabilityItem.customStartTime,
      customEndTime: availabilityItem.customEndTime,
      customLocation: availabilityItem.customLocation,
      customMaxPatients: availabilityItem.customMaxPatients,
      notes: availabilityItem.notes || '',
      notifyPatients: availabilityItem.notifyPatients,
      autoReschedule: availabilityItem.autoReschedule
    })
    setIsAvailabilityDialogOpen(true)
  }

  const handleDeleteAvailability = async (availabilityId: string) => {
    if (window.confirm('Are you sure you want to delete this availability record?')) {
      try {
        await deleteAvailability(availabilityId)
        toast.success('Availability record deleted successfully')
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete availability record')
      }
    }
  }

  const openScheduleDialog = () => {
    setEditingSchedule(null)
    setScheduleFormData({
      status: 'active',
      scheduleType: 'regular',
      slotDurationMinutes: 15,
      maxPatients: 20,
      isRecurring: true,
      priority: 1,
      breakTimes: []
    })
    setIsScheduleDialogOpen(true)
  }

  const openAvailabilityDialog = () => {
    setEditingAvailability(null)
    setAvailabilityFormData({
      isAvailable: false,
      availabilityType: 'override',
      notifyPatients: true,
      autoReschedule: false
    })
    setIsAvailabilityDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-end">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate('/users/create?role=doctor')}
          >
            <UserCircleIcon className="h-4 w-4" />
            Add Doctor
          </Button>

          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2" onClick={openScheduleDialog}>
                <CalendarIcon className="h-4 w-4" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingSchedule ? 'Edit Schedule' : 'Add Schedule'}</DialogTitle>
                <DialogDescription>
                  {editingSchedule ? 'Update the doctor schedule' : 'Create a new schedule for a doctor'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="scheduleDoctor">Doctor *</Label>
                  <Select value={scheduleFormData.userId} onValueChange={(value) => setScheduleFormData({ ...scheduleFormData, userId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.filter(d => d.isActive).map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          Dr. {doctor.name} - {doctor.specialization || doctor.department}
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
                    <Label htmlFor="scheduleType">Schedule Type</Label>
                    <Select value={scheduleFormData.scheduleType} onValueChange={(value) => setScheduleFormData({ ...scheduleFormData, scheduleType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Schedule type" />
                      </SelectTrigger>
                      <SelectContent>
                        {scheduleTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
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
                    <Select value={scheduleFormData.location} onValueChange={(value) => setScheduleFormData({ ...scheduleFormData, location: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.value} value={location.value}>{location.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="slotDuration">Slot Duration (minutes)</Label>
                    <Select
                      value={String(scheduleFormData.slotDurationMinutes)}
                      onValueChange={(value) => setScheduleFormData({ ...scheduleFormData, slotDurationMinutes: Number(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="20">20 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={String(scheduleFormData.priority)}
                      onValueChange={(value) => setScheduleFormData({ ...scheduleFormData, priority: Number(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Low</SelectItem>
                        <SelectItem value="2">Medium</SelectItem>
                        <SelectItem value="3">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={scheduleFormData.notes || ''}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, notes: e.target.value })}
                    placeholder="Additional notes"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddSchedule} disabled={loading}>
                  {loading ? 'Saving...' : editingSchedule ? 'Update Schedule' : 'Add Schedule'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAvailabilityDialogOpen} onOpenChange={setIsAvailabilityDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" onClick={openAvailabilityDialog}>
                <ClockIcon className="h-4 w-4" />
                Update Availability
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingAvailability ? 'Edit Availability' : 'Update Availability'}</DialogTitle>
                <DialogDescription>
                  {editingAvailability ? 'Update doctor availability' : 'Mark doctor availability for specific dates'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="availabilityDoctor">Doctor *</Label>
                  <Select value={availabilityFormData.userId} onValueChange={(value) => setAvailabilityFormData({ ...availabilityFormData, userId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.filter(d => d.isActive).map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          Dr. {doctor.name} - {doctor.specialization || doctor.department}
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

                <div className="grid grid-cols-2 gap-4">
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

                  <div className="space-y-2">
                    <Label htmlFor="availabilityType">Type</Label>
                    <Select
                      value={availabilityFormData.availabilityType}
                      onValueChange={(value) => setAvailabilityFormData({ ...availabilityFormData, availabilityType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availabilityTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                      <Select
                        value={availabilityFormData.replacementDoctorId}
                        onValueChange={(value) => setAvailabilityFormData({ ...availabilityFormData, replacementDoctorId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select replacement doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.filter(d => d.isActive && d.id !== availabilityFormData.userId).map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              Dr. {doctor.name} - {doctor.specialization || doctor.department}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {availabilityFormData.isAvailable && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customStartTime">Custom Start Time</Label>
                      <Input
                        id="customStartTime"
                        type="time"
                        value={availabilityFormData.customStartTime || ''}
                        onChange={(e) => setAvailabilityFormData({ ...availabilityFormData, customStartTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customEndTime">Custom End Time</Label>
                      <Input
                        id="customEndTime"
                        type="time"
                        value={availabilityFormData.customEndTime || ''}
                        onChange={(e) => setAvailabilityFormData({ ...availabilityFormData, customEndTime: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={availabilityFormData.notes || ''}
                    onChange={(e) => setAvailabilityFormData({ ...availabilityFormData, notes: e.target.value })}
                    placeholder="Additional notes"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAvailabilityDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateAvailability} disabled={loading}>
                  {loading ? 'Saving...' : editingAvailability ? 'Update Availability' : 'Update Availability'}
                </Button>
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
            <UserCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctors.filter(d => d.isActive).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules.filter(s => s.status === 'active').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today Available</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
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
            <StethoscopeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(doctors.map(d => d.specialization || d.department)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

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
                        <CalendarBlankIcon className="h-4 w-4" />
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
                                <h4 className="font-medium">
                                  Dr. {schedule.doctor?.name || 'Unknown'}
                                </h4>
                                <div className="flex items-center gap-1">
                                  <Badge
                                    variant={
                                      schedule.scheduleType === 'emergency' ? 'destructive' :
                                        schedule.scheduleType === 'surgery' ? 'default' :
                                          'secondary'
                                    }
                                  >
                                    {scheduleTypes.find(t => t.value === schedule.scheduleType)?.label || schedule.scheduleType}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditSchedule(schedule)}
                                  >
                                    <PencilSimpleIcon className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteSchedule(schedule.id)}
                                  >
                                    <TrashIcon className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div className="flex items-center gap-1">
                                  <ClockIcon className="h-3 w-3" />
                                  {schedule.startTime} - {schedule.endTime}
                                  {schedule.duration && <span className="text-xs">({schedule.duration})</span>}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPinIcon className="h-3 w-3" />
                                  {schedule.location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <UserCircleIcon className="h-3 w-3" />
                                  Max: {schedule.maxPatients} patients
                                </div>
                                {schedule.totalSlots && (
                                  <div className="text-xs">
                                    {schedule.totalSlots} slots ({schedule.slotDurationMinutes}min each)
                                  </div>
                                )}
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
                    <UserCircleIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No doctors registered</h3>
                    <p className="text-muted-foreground">Start by adding your first doctor</p>
                  </div>
                ) : (
                  doctors.map((doctor) => (
                    <div key={doctor.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                          <UserCircleIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium">Dr. {doctor.name}</h3>
                            <Badge variant="outline">{doctor.id}</Badge>
                            <Badge variant={doctor.isActive ? 'default' : 'secondary'}>
                              {doctor.isActive ? 'active' : 'inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{doctor.specialization || doctor.department}</span>
                            <span>{doctor.department}</span>
                            {doctor.email && <span>{doctor.email}</span>}
                            {doctor.phone && <span>{doctor.phone}</span>}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/users/${doctor.id}`)}>
                        <PencilSimpleIcon className="h-4 w-4" />
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
                          <UserCircleIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-medium">Dr. {doctor.name}</h3>
                          <p className="text-sm text-muted-foreground">{doctor.specialization || doctor.department}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isAvailable ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircleIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">Available</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600">
                            <XCircleIcon className="h-4 w-4" />
                            <div className="text-sm">
                              <span className="font-medium">Not Available</span>
                              {todayAvailability?.reason && (
                                <p className="text-xs">{todayAvailability.reason}</p>
                              )}
                              {todayAvailability?.replacementDoctor && (
                                <p className="text-xs">Replacement: Dr. {todayAvailability.replacementDoctor.name}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {todayAvailability && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAvailability(todayAvailability)}
                            >
                              <PencilSimpleIcon className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAvailability(todayAvailability.id)}
                            >
                              <TrashIcon className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Show recent availability records */}
                {availability.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-4">Recent Availability Changes</h4>
                    <div className="space-y-2">
                      {availability.slice(0, 10).map((avail) => (
                        <div key={avail.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant={avail.isAvailable ? 'default' : 'destructive'}>
                              {avail.isAvailable ? 'Available' : 'Not Available'}
                            </Badge>
                            <span className="text-sm">
                              Dr. {avail.doctor?.name || 'Unknown'} - {avail.date}
                            </span>
                            {avail.reason && (
                              <span className="text-xs text-muted-foreground">({avail.reason})</span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAvailability(avail)}
                            >
                              <PencilSimpleIcon className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAvailability(avail.id)}
                            >
                              <TrashIcon className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}