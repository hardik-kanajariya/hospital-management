import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Bed,
  Plus,
  Search,
  Users,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Calendar,
  User,
  Home,
} from '@phosphor-icons/react';
import { toast } from 'sonner'

interface Room {
  id: string
  number: string
  type: 'general' | 'private' | 'icu' | 'emergency' | 'maternity' | 'pediatric'
  department: string
  floor: number
  capacity: number
  amenities: string[]
  dailyRate: number
  status: 'active' | 'maintenance' | 'inactive'
}

interface BedInfo {
  id: string
  roomId: string
  roomNumber: string
  bedNumber: string
  type: 'general' | 'icu' | 'emergency' | 'maternity' | 'pediatric'
  status: 'available' | 'occupied' | 'maintenance' | 'reserved'
  patientId?: string
  patientName?: string
  admissionDate?: string
  expectedDischarge?: string
  lastCleaned?: string
  notes?: string
}

interface Admission {
  id: string
  patientId: string
  patientName: string
  bedId: string
  roomNumber: string
  bedNumber: string
  admissionDate: string
  expectedDischarge?: string
  actualDischarge?: string
  status: 'active' | 'discharged' | 'transferred'
  admittingDoctor: string
  diagnosis: string
  notes?: string
  charges: {
    roomCharges: number
    medicineCharges: number
    procedureCharges: number
    otherCharges: number
  }
}

const roomTypes = [
  { value: 'general', label: 'General Ward', rate: 800 },
  { value: 'private', label: 'Private Room', rate: 2000 },
  { value: 'icu', label: 'ICU', rate: 5000 },
  { value: 'emergency', label: 'Emergency', rate: 1500 },
  { value: 'maternity', label: 'Maternity', rate: 1200 },
  { value: 'pediatric', label: 'Pediatric', rate: 1000 }
]

const departments = [
  'Emergency', 'General Medicine', 'Surgery', 'Pediatrics', 'Maternity', 'ICU', 'Orthopedics'
]

const amenities = [
  'AC', 'TV', 'WiFi', 'Attached Bathroom', 'Refrigerator', 'Attendant Bed', 'Phone'
]

export default function BedManagement() {
  const [patients] = useKV('hospital-patients', [])
  const [doctors] = useKV('hospital-doctors', [])
  const [rooms, setRooms] = useKV<Room[]>('hospital-rooms', [])
  const [beds, setBeds] = useKV<BedInfo[]>('hospital-beds', [])
  const [admissions, setAdmissions] = useKV<Admission[]>('hospital-admissions', [])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [selectedBed, setSelectedBed] = useState<BedInfo | null>(null)
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false)
  const [isBedDialogOpen, setIsBedDialogOpen] = useState(false)
  const [isAdmissionDialogOpen, setIsAdmissionDialogOpen] = useState(false)
  
  const [roomFormData, setRoomFormData] = useState<Partial<Room>>({
    status: 'active',
    floor: 1,
    amenities: []
  })
  
  const [bedFormData, setBedFormData] = useState<Partial<BedInfo>>({
    status: 'available'
  })

  const [admissionFormData, setAdmissionFormData] = useState<Partial<Admission>>({
    status: 'active',
    charges: {
      roomCharges: 0,
      medicineCharges: 0,
      procedureCharges: 0,
      otherCharges: 0
    }
  })

  const handleAddRoom = () => {
    if (!roomFormData.number || !roomFormData.type || !roomFormData.department) {
      toast.error('Please fill in all required fields')
      return
    }

    // Check if room number already exists
    const existingRoom = rooms.find(r => r.number === roomFormData.number)
    if (existingRoom) {
      toast.error('Room number already exists')
      return
    }

    const roomTypeInfo = roomTypes.find(rt => rt.value === roomFormData.type)
    
    const newRoom: Room = {
      id: `RM${Date.now()}`,
      number: roomFormData.number!,
      type: roomFormData.type as any,
      department: roomFormData.department!,
      floor: Number(roomFormData.floor) || 1,
      capacity: Number(roomFormData.capacity) || 1,
      amenities: roomFormData.amenities || [],
      dailyRate: Number(roomFormData.dailyRate) || roomTypeInfo?.rate || 800,
      status: roomFormData.status as any
    }

    setRooms(current => [...current, newRoom])
    
    // Create beds for the room
    const newBeds: BedInfo[] = []
    for (let i = 1; i <= newRoom.capacity; i++) {
      newBeds.push({
        id: `BD${Date.now()}_${i}`,
        roomId: newRoom.id,
        roomNumber: newRoom.number,
        bedNumber: `${newRoom.number}-${i}`,
        type: newRoom.type,
        status: 'available',
        lastCleaned: new Date().toISOString().split('T')[0]
      })
    }
    
    setBeds(current => [...current, ...newBeds])
    setRoomFormData({ status: 'active', floor: 1, amenities: [] })
    setIsRoomDialogOpen(false)
    toast.success('Room and beds added successfully')
  }

  const handleAdmitPatient = () => {
    if (!admissionFormData.patientId || !admissionFormData.bedId || !admissionFormData.admittingDoctor) {
      toast.error('Please fill in all required fields')
      return
    }

    const patient = patients.find(p => p.id === admissionFormData.patientId)
    const bed = beds.find(b => b.id === admissionFormData.bedId)
    
    if (!patient || !bed) {
      toast.error('Patient or bed not found')
      return
    }

    if (bed.status !== 'available') {
      toast.error('Selected bed is not available')
      return
    }

    const newAdmission: Admission = {
      id: `ADM${Date.now()}`,
      patientId: admissionFormData.patientId!,
      patientName: patient.name,
      bedId: admissionFormData.bedId!,
      roomNumber: bed.roomNumber,
      bedNumber: bed.bedNumber,
      admissionDate: admissionFormData.admissionDate || new Date().toISOString().split('T')[0],
      expectedDischarge: admissionFormData.expectedDischarge,
      status: admissionFormData.status as any,
      admittingDoctor: admissionFormData.admittingDoctor!,
      diagnosis: admissionFormData.diagnosis || '',
      notes: admissionFormData.notes,
      charges: admissionFormData.charges!
    }

    // Update bed status to occupied
    setBeds(current => 
      current.map(b => 
        b.id === bed.id 
          ? { 
              ...b, 
              status: 'occupied', 
              patientId: patient.id,
              patientName: patient.name,
              admissionDate: newAdmission.admissionDate,
              expectedDischarge: newAdmission.expectedDischarge
            }
          : b
      )
    )

    setAdmissions(current => [...current, newAdmission])
    setAdmissionFormData({ 
      status: 'active',
      charges: {
        roomCharges: 0,
        medicineCharges: 0,
        procedureCharges: 0,
        otherCharges: 0
      }
    })
    setIsAdmissionDialogOpen(false)
    toast.success('Patient admitted successfully')
  }

  const handleDischargePatient = (admission: Admission) => {
    // Update admission status
    setAdmissions(current => 
      current.map(a => 
        a.id === admission.id 
          ? { ...a, status: 'discharged', actualDischarge: new Date().toISOString().split('T')[0] }
          : a
      )
    )

    // Update bed status to available
    setBeds(current => 
      current.map(b => 
        b.id === admission.bedId 
          ? { 
              ...b, 
              status: 'available', 
              patientId: undefined,
              patientName: undefined,
              admissionDate: undefined,
              expectedDischarge: undefined,
              lastCleaned: new Date().toISOString().split('T')[0]
            }
          : b
      )
    )

    toast.success('Patient discharged successfully')
  }

  const handleBedStatusUpdate = (bedId: string, newStatus: BedInfo['status']) => {
    setBeds(current => 
      current.map(b => 
        b.id === bedId 
          ? { ...b, status: newStatus }
          : b
      )
    )
    toast.success('Bed status updated')
  }

  const filteredBeds = beds.filter(bed =>
    bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bed.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bed.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const bedStats = {
    total: beds.length,
    available: beds.filter(b => b.status === 'available').length,
    occupied: beds.filter(b => b.status === 'occupied').length,
    maintenance: beds.filter(b => b.status === 'maintenance').length
  }

  const occupancyRate = bedStats.total > 0 ? Math.round((bedStats.occupied / bedStats.total) * 100) : 0

  const activeAdmissions = admissions.filter(a => a.status === 'active')
  const todayAdmissions = admissions.filter(a => a.admissionDate === new Date().toISOString().split('T')[0])

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search beds by room, bed number, or patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Add Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Room</DialogTitle>
                <DialogDescription>Create a new room with beds</DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomNumber">Room Number *</Label>
                    <Input
                      id="roomNumber"
                      value={roomFormData.number || ''}
                      onChange={(e) => setRoomFormData({...roomFormData, number: e.target.value})}
                      placeholder="e.g., 101, A-23"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roomType">Room Type *</Label>
                    <Select value={roomFormData.type} onValueChange={(value) => setRoomFormData({...roomFormData, type: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                      <SelectContent>
                        {roomTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label} - ₹{type.rate}/day
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select value={roomFormData.department} onValueChange={(value) => setRoomFormData({...roomFormData, department: value})}>
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
                  <div className="space-y-2">
                    <Label htmlFor="floor">Floor *</Label>
                    <Input
                      id="floor"
                      type="number"
                      value={roomFormData.floor || ''}
                      onChange={(e) => setRoomFormData({...roomFormData, floor: Number(e.target.value)})}
                      placeholder="Floor number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Bed Capacity *</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={roomFormData.capacity || ''}
                      onChange={(e) => setRoomFormData({...roomFormData, capacity: Number(e.target.value)})}
                      placeholder="Number of beds"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dailyRate">Daily Rate (₹)</Label>
                    <Input
                      id="dailyRate"
                      type="number"
                      value={roomFormData.dailyRate || ''}
                      onChange={(e) => setRoomFormData({...roomFormData, dailyRate: Number(e.target.value)})}
                      placeholder="Daily charges"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Amenities</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {amenities.map((amenity) => (
                      <label key={amenity} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={roomFormData.amenities?.includes(amenity) || false}
                          onChange={(e) => {
                            const currentAmenities = roomFormData.amenities || []
                            if (e.target.checked) {
                              setRoomFormData({...roomFormData, amenities: [...currentAmenities, amenity]})
                            } else {
                              setRoomFormData({...roomFormData, amenities: currentAmenities.filter(a => a !== amenity)})
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsRoomDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddRoom}>Add Room</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAdmissionDialogOpen} onOpenChange={setIsAdmissionDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Admit Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Admit Patient</DialogTitle>
                <DialogDescription>Admit a patient to an available bed</DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient">Patient *</Label>
                    <Select value={admissionFormData.patientId} onValueChange={(value) => setAdmissionFormData({...admissionFormData, patientId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name} - {patient.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bed">Available Bed *</Label>
                    <Select value={admissionFormData.bedId} onValueChange={(value) => setAdmissionFormData({...admissionFormData, bedId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bed" />
                      </SelectTrigger>
                      <SelectContent>
                        {beds.filter(b => b.status === 'available').map((bed) => (
                          <SelectItem key={bed.id} value={bed.id}>
                            {bed.bedNumber} - {bed.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admittingDoctor">Admitting Doctor *</Label>
                    <Select value={admissionFormData.admittingDoctor} onValueChange={(value) => setAdmissionFormData({...admissionFormData, admittingDoctor: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.filter(d => d.status === 'active').map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.name}>
                            Dr. {doctor.name} - {doctor.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admissionDate">Admission Date</Label>
                    <Input
                      id="admissionDate"
                      type="date"
                      value={admissionFormData.admissionDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setAdmissionFormData({...admissionFormData, admissionDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expectedDischarge">Expected Discharge</Label>
                    <Input
                      id="expectedDischarge"
                      type="date"
                      value={admissionFormData.expectedDischarge || ''}
                      onChange={(e) => setAdmissionFormData({...admissionFormData, expectedDischarge: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Diagnosis</Label>
                    <Input
                      id="diagnosis"
                      value={admissionFormData.diagnosis || ''}
                      onChange={(e) => setAdmissionFormData({...admissionFormData, diagnosis: e.target.value})}
                      placeholder="Primary diagnosis"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Admission Notes</Label>
                  <Textarea
                    id="notes"
                    value={admissionFormData.notes || ''}
                    onChange={(e) => setAdmissionFormData({...admissionFormData, notes: e.target.value})}
                    placeholder="Additional notes about the admission"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAdmissionDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAdmitPatient}>Admit Patient</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Beds</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bedStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{bedStats.available}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{bedStats.occupied}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Admissions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAdmissions.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="beds" className="space-y-4">
        <TabsList>
          <TabsTrigger value="beds">Bed Status</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="admissions">Admissions</TabsTrigger>
        </TabsList>

        <TabsContent value="beds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bed Management</CardTitle>
              <CardDescription>
                {filteredBeds.length} of {beds.length} beds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredBeds.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <Bed className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No beds found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first room'}
                    </p>
                  </div>
                ) : (
                  filteredBeds.map((bed) => (
                    <div key={bed.id} className={`border rounded-lg p-4 ${
                      bed.status === 'available' ? 'border-green-200 bg-green-50' :
                      bed.status === 'occupied' ? 'border-blue-200 bg-blue-50' :
                      bed.status === 'maintenance' ? 'border-yellow-200 bg-yellow-50' :
                      'border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{bed.bedNumber}</h3>
                        <Badge variant={
                          bed.status === 'available' ? 'default' :
                          bed.status === 'occupied' ? 'secondary' :
                          bed.status === 'maintenance' ? 'destructive' : 'outline'
                        }>
                          {bed.status}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>Room {bed.roomNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Bed className="h-3 w-3" />
                          <span>{bed.type}</span>
                        </div>
                        {bed.patientName && (
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            <span>{bed.patientName}</span>
                          </div>
                        )}
                        {bed.admissionDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>Since {new Date(bed.admissionDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {bed.lastCleaned && (
                          <div className="text-xs text-muted-foreground">
                            Last cleaned: {new Date(bed.lastCleaned).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {bed.status !== 'occupied' && (
                        <div className="mt-3">
                          <Select 
                            value={bed.status} 
                            onValueChange={(value) => handleBedStatusUpdate(bed.id, value as any)}
                          >
                            <SelectTrigger className="w-full h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="reserved">Reserved</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {bed.notes && (
                        <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                          {bed.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Room Directory</CardTitle>
              <CardDescription>All hospital rooms and their configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rooms.length === 0 ? (
                  <div className="text-center py-8">
                    <Home className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No rooms configured</h3>
                    <p className="text-muted-foreground">Start by adding your first room</p>
                  </div>
                ) : (
                  rooms.map((room) => {
                    const roomBeds = beds.filter(b => b.roomId === room.id)
                    const occupiedBeds = roomBeds.filter(b => b.status === 'occupied').length
                    
                    return (
                      <div key={room.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium">Room {room.number}</h3>
                            <Badge variant="outline">{room.type}</Badge>
                            <Badge variant={room.status === 'active' ? 'default' : 'secondary'}>
                              {room.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ₹{room.dailyRate}/day
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-2 text-sm">
                            <div><strong>Department:</strong> {room.department}</div>
                            <div><strong>Floor:</strong> {room.floor}</div>
                            <div><strong>Capacity:</strong> {room.capacity} beds</div>
                            <div><strong>Occupancy:</strong> {occupiedBeds}/{room.capacity} beds</div>
                          </div>

                          {room.amenities.length > 0 && (
                            <div>
                              <div className="text-sm font-medium mb-2">Amenities:</div>
                              <div className="flex flex-wrap gap-1">
                                {room.amenities.map((amenity) => (
                                  <Badge key={amenity} variant="outline" className="text-xs">
                                    {amenity}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 pt-3 border-t">
                          <div className="text-sm font-medium mb-2">Beds:</div>
                          <div className="flex flex-wrap gap-2">
                            {roomBeds.map((bed) => (
                              <Badge 
                                key={bed.id} 
                                variant={
                                  bed.status === 'available' ? 'default' :
                                  bed.status === 'occupied' ? 'secondary' :
                                  'destructive'
                                }
                                className="text-xs"
                              >
                                {bed.bedNumber}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Admissions</CardTitle>
              <CardDescription>All active patient admissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeAdmissions.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No active admissions</h3>
                    <p className="text-muted-foreground">Current admissions will appear here</p>
                  </div>
                ) : (
                  activeAdmissions.map((admission) => {
                    const daysSinceAdmission = Math.floor(
                      (new Date().getTime() - new Date(admission.admissionDate).getTime()) / (1000 * 60 * 60 * 24)
                    )
                    
                    return (
                      <div key={admission.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium">{admission.patientName}</h3>
                            <Badge variant="outline">{admission.id}</Badge>
                            <Badge variant="secondary">{admission.bedNumber}</Badge>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDischargePatient(admission)}
                          >
                            Discharge
                          </Button>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-2 text-sm">
                            <div><strong>Admitting Doctor:</strong> {admission.admittingDoctor}</div>
                            <div><strong>Admission Date:</strong> {new Date(admission.admissionDate).toLocaleDateString()}</div>
                            <div><strong>Days Admitted:</strong> {daysSinceAdmission}</div>
                            {admission.expectedDischarge && (
                              <div><strong>Expected Discharge:</strong> {new Date(admission.expectedDischarge).toLocaleDateString()}</div>
                            )}
                            {admission.diagnosis && (
                              <div><strong>Diagnosis:</strong> {admission.diagnosis}</div>
                            )}
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="font-medium">Charges Summary:</div>
                            <div>Room Charges: ₹{admission.charges.roomCharges}</div>
                            <div>Medicine Charges: ₹{admission.charges.medicineCharges}</div>
                            <div>Procedure Charges: ₹{admission.charges.procedureCharges}</div>
                            <div>Other Charges: ₹{admission.charges.otherCharges}</div>
                            <div className="font-medium pt-1 border-t">
                              Total: ₹{Object.values(admission.charges).reduce((sum, charge) => sum + charge, 0)}
                            </div>
                          </div>
                        </div>

                        {admission.notes && (
                          <div className="mt-3 p-2 bg-muted/30 rounded text-sm">
                            <strong>Notes:</strong> {admission.notes}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}