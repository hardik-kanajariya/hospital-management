import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserPlus, Search, Edit, Eye, Phone, Mail, User, MapPin } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Patient {
  id: string
  name: string
  age: number
  gender: string
  phone: string
  email?: string
  address: string
  bloodGroup?: string
  emergencyContact: string
  medicalHistory?: string
  allergies?: string
  insurance?: {
    provider: string
    policyNumber: string
    validUntil: string
  }
  createdAt: string
  lastVisit?: string
}

export default function PatientManagement() {
  const [patients, setPatients] = useKV('hospital-patients', [])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    bloodGroup: '',
    emergencyContact: '',
    medicalHistory: '',
    allergies: '',
    hasInsurance: false,
    insuranceProvider: '',
    policyNumber: '',
    policyValidUntil: ''
  })

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm) ||
    patient.id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddPatient = () => {
    if (!newPatient.name || !newPatient.age || !newPatient.gender || !newPatient.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    const patient: Patient = {
      id: `PAT${Date.now()}`,
      name: newPatient.name,
      age: parseInt(newPatient.age),
      gender: newPatient.gender,
      phone: newPatient.phone,
      email: newPatient.email,
      address: newPatient.address,
      bloodGroup: newPatient.bloodGroup,
      emergencyContact: newPatient.emergencyContact,
      medicalHistory: newPatient.medicalHistory,
      allergies: newPatient.allergies,
      insurance: newPatient.hasInsurance ? {
        provider: newPatient.insuranceProvider,
        policyNumber: newPatient.policyNumber,
        validUntil: newPatient.policyValidUntil
      } : undefined,
      createdAt: new Date().toISOString(),
    }

    setPatients(currentPatients => [...currentPatients, patient])
    setNewPatient({
      name: '',
      age: '',
      gender: '',
      phone: '',
      email: '',
      address: '',
      bloodGroup: '',
      emergencyContact: '',
      medicalHistory: '',
      allergies: '',
      hasInsurance: false,
      insuranceProvider: '',
      policyNumber: '',
      policyValidUntil: ''
    })
    setIsDialogOpen(false)
    toast.success(`Patient ${patient.name} registered successfully with ID: ${patient.id}`)
  }

  const handleUpdatePatient = () => {
    if (!selectedPatient) return

    setPatients(currentPatients =>
      currentPatients.map(patient =>
        patient.id === selectedPatient.id ? selectedPatient : patient
      )
    )
    setIsEditing(false)
    toast.success('Patient information updated successfully')
  }

  const getPatientAge = (patient: Patient) => {
    const today = new Date()
    const birthYear = today.getFullYear() - patient.age
    return today.getFullYear() - birthYear
  }

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search patients by name, phone, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add New Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register New Patient</DialogTitle>
              <DialogDescription>
                Enter patient information to create a new medical record.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                    placeholder="Age in years"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select onValueChange={(value) => setNewPatient({...newPatient, gender: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select onValueChange={(value) => setNewPatient({...newPatient, bloodGroup: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                    placeholder="patient@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
                  placeholder="Complete address with village/city, district, state"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={newPatient.emergencyContact}
                  onChange={(e) => setNewPatient({...newPatient, emergencyContact: e.target.value})}
                  placeholder="Emergency contact number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalHistory">Medical History</Label>
                <Textarea
                  id="medicalHistory"
                  value={newPatient.medicalHistory}
                  onChange={(e) => setNewPatient({...newPatient, medicalHistory: e.target.value})}
                  placeholder="Previous medical conditions, surgeries, medications..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Known Allergies</Label>
                <Textarea
                  id="allergies"
                  value={newPatient.allergies}
                  onChange={(e) => setNewPatient({...newPatient, allergies: e.target.value})}
                  placeholder="Food allergies, drug allergies, environmental allergies..."
                  rows={2}
                />
              </div>

              {/* Insurance Information */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Insurance Information</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newPatient.hasInsurance}
                      onChange={(e) => setNewPatient({...newPatient, hasInsurance: e.target.checked})}
                      className="rounded"
                    />
                    <Label className="text-sm">Has Insurance</Label>
                  </div>
                </div>

                {newPatient.hasInsurance && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Insurance Provider</Label>
                        <Input
                          value={newPatient.insuranceProvider}
                          onChange={(e) => setNewPatient({...newPatient, insuranceProvider: e.target.value})}
                          placeholder="Insurance company name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Policy Number</Label>
                        <Input
                          value={newPatient.policyNumber}
                          onChange={(e) => setNewPatient({...newPatient, policyNumber: e.target.value})}
                          placeholder="Policy/Card number"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Policy Valid Until</Label>
                      <Input
                        type="date"
                        value={newPatient.policyValidUntil}
                        onChange={(e) => setNewPatient({...newPatient, policyValidUntil: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPatient}>
                Register Patient
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Patients List */}
      <div className="grid gap-4">
        {filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No patients found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search criteria' : 'Start by registering your first patient'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold">
                      {patient.name?.charAt(0)?.toUpperCase() || 'P'}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{patient.name}</h3>
                        <Badge variant="outline">{patient.id}</Badge>
                        {patient.bloodGroup && (
                          <Badge variant="secondary">{patient.bloodGroup}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{patient.age} years • {patient.gender}</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {patient.phone}
                        </span>
                        {patient.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {patient.email}
                          </span>
                        )}
                      </div>
                      {patient.address && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {patient.address}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedPatient(patient)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Patient Details</DialogTitle>
                          <DialogDescription>
                            Complete medical record for {patient.name}
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedPatient && (
                          <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="details">Personal Details</TabsTrigger>
                              <TabsTrigger value="medical">Medical Information</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="details" className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Patient ID</Label>
                                  <p className="text-sm">{selectedPatient.id}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Registration Date</Label>
                                  <p className="text-sm">{new Date(selectedPatient.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                                  <p className="text-sm">{selectedPatient.name}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Age & Gender</Label>
                                  <p className="text-sm">{selectedPatient.age} years, {selectedPatient.gender}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                                  <p className="text-sm">{selectedPatient.phone}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                                  <p className="text-sm">{selectedPatient.email || 'Not provided'}</p>
                                </div>
                                <div className="col-span-2">
                                  <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                                  <p className="text-sm">{selectedPatient.address || 'Not provided'}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Emergency Contact</Label>
                                  <p className="text-sm">{selectedPatient.emergencyContact || 'Not provided'}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Blood Group</Label>
                                  <p className="text-sm">{selectedPatient.bloodGroup || 'Not specified'}</p>
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="medical" className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Medical History</Label>
                                <p className="text-sm mt-1">{selectedPatient.medicalHistory || 'No medical history recorded'}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Known Allergies</Label>
                                <p className="text-sm mt-1">{selectedPatient.allergies || 'No known allergies'}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Insurance Information</Label>
                                {selectedPatient.insurance ? (
                                  <div className="text-sm mt-1 space-y-1">
                                    <p><strong>Provider:</strong> {selectedPatient.insurance.provider}</p>
                                    <p><strong>Policy Number:</strong> {selectedPatient.insurance.policyNumber}</p>
                                    <p><strong>Valid Until:</strong> {new Date(selectedPatient.insurance.validUntil).toLocaleDateString()}</p>
                                  </div>
                                ) : (
                                  <p className="text-sm mt-1">No insurance information</p>
                                )}
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Last Visit</Label>
                                <p className="text-sm mt-1">{selectedPatient.lastVisit ? new Date(selectedPatient.lastVisit).toLocaleDateString() : 'No previous visits'}</p>
                              </div>
                            </TabsContent>
                          </Tabs>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedPatient(patient)
                        setIsEditing(true)
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Patient Dialog */}
      {selectedPatient && (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Patient Information</DialogTitle>
              <DialogDescription>
                Update patient details for {selectedPatient.name}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={selectedPatient.name}
                    onChange={(e) => setSelectedPatient({...selectedPatient, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input
                    type="number"
                    value={selectedPatient.age}
                    onChange={(e) => setSelectedPatient({...selectedPatient, age: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={selectedPatient.phone}
                    onChange={(e) => setSelectedPatient({...selectedPatient, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={selectedPatient.email || ''}
                    onChange={(e) => setSelectedPatient({...selectedPatient, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea
                  value={selectedPatient.address}
                  onChange={(e) => setSelectedPatient({...selectedPatient, address: e.target.value})}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Medical History</Label>
                <Textarea
                  value={selectedPatient.medicalHistory || ''}
                  onChange={(e) => setSelectedPatient({...selectedPatient, medicalHistory: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Known Allergies</Label>
                <Textarea
                  value={selectedPatient.allergies || ''}
                  onChange={(e) => setSelectedPatient({...selectedPatient, allergies: e.target.value})}
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePatient}>
                Update Patient
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}