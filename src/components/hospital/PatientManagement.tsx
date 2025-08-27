import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Heart,
  AlertTriangle
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Patient {
  id: string
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  phone: string
  email?: string
  address: string
  bloodGroup?: string
  emergencyContact: string
  emergencyPhone: string
  allergies?: string
  medicalHistory?: string
  insurance?: {
    provider: string
    policyNumber: string
    validUntil: string
  }
  registrationDate: string
  createdAt: string
}

export default function PatientManagement() {
  const [patients, setPatients] = useKV<Patient[]>('hospital-patients', [])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Patient>>({
    gender: 'male'
  })

  // Filter patients based on search
  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm) ||
    patient.id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddPatient = () => {
    if (!formData.name || !formData.age || !formData.phone || !formData.address) {
      toast.error('Please fill in all required fields')
      return
    }

    const newPatient: Patient = {
      id: `PT${Date.now()}`,
      name: formData.name,
      age: Number(formData.age),
      gender: formData.gender as 'male' | 'female' | 'other',
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      bloodGroup: formData.bloodGroup,
      emergencyContact: formData.emergencyContact || '',
      emergencyPhone: formData.emergencyPhone || '',
      allergies: formData.allergies,
      medicalHistory: formData.medicalHistory,
      insurance: formData.insurance,
      registrationDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    }

    setPatients(current => [...current, newPatient])
    setFormData({ gender: 'male' })
    setIsAddDialogOpen(false)
    toast.success('Patient registered successfully')
  }

  const handleEditPatient = (patient: Patient) => {
    setFormData(patient)
    setSelectedPatient(patient)
    setIsAddDialogOpen(true)
  }

  const handleUpdatePatient = () => {
    if (!selectedPatient) return

    setPatients(current => 
      current.map(p => 
        p.id === selectedPatient.id 
          ? { ...p, ...formData }
          : p
      )
    )
    setFormData({ gender: 'male' })
    setSelectedPatient(null)
    setIsAddDialogOpen(false)
    toast.success('Patient updated successfully')
  }

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsViewDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search patients by name, phone, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedPatient ? 'Edit Patient' : 'Register New Patient'}
              </DialogTitle>
              <DialogDescription>
                {selectedPatient ? 'Update patient information' : 'Enter patient details to register them in the system'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age || ''}
                    onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
                    placeholder="Enter age"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value as any})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select value={formData.bloodGroup} onValueChange={(value) => setFormData({...formData, bloodGroup: value})}>
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

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Enter complete address"
                  rows={2}
                />
              </div>

              {/* Emergency Contact */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact || ''}
                    onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                    placeholder="Emergency contact name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyPhone || ''}
                    onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})}
                    placeholder="Emergency phone number"
                  />
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-2">
                <Label htmlFor="allergies">Known Allergies</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies || ''}
                  onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                  placeholder="List any known allergies"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalHistory">Medical History</Label>
                <Textarea
                  id="medicalHistory"
                  value={formData.medicalHistory || ''}
                  onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
                  placeholder="Previous medical conditions, surgeries, etc."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setIsAddDialogOpen(false)
                setFormData({ gender: 'male' })
                setSelectedPatient(null)
              }}>
                Cancel
              </Button>
              <Button onClick={selectedPatient ? handleUpdatePatient : handleAddPatient}>
                {selectedPatient ? 'Update Patient' : 'Register Patient'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Registrations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter(p => p.registrationDate === new Date().toISOString().split('T')[0]).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Allergies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter(p => p.allergies && p.allergies.trim()).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insured Patients</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter(p => p.insurance?.provider).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patients List */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Registry</CardTitle>
          <CardDescription>
            {filteredPatients.length} of {patients.length} patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No patients found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start by registering your first patient'}
                </p>
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-medium">
                      {patient.name?.charAt(0)?.toUpperCase() || 'P'}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{patient.name}</h3>
                        <Badge variant="outline">{patient.id}</Badge>
                        {patient.bloodGroup && (
                          <Badge variant="secondary">{patient.bloodGroup}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Age {patient.age} • {patient.gender}</span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {patient.phone}
                        </span>
                        {patient.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {patient.email}
                          </span>
                        )}
                      </div>
                      {patient.allergies && (
                        <div className="flex items-center gap-1 text-sm text-destructive">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Allergies: {patient.allergies}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewPatient(patient)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditPatient(patient)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Patient Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>Complete patient information</DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-medium">
                  {selectedPatient.name?.charAt(0)?.toUpperCase() || 'P'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedPatient.name}</h2>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>ID: {selectedPatient.id}</span>
                    <span>Age: {selectedPatient.age}</span>
                    <span>Gender: {selectedPatient.gender}</span>
                    {selectedPatient.bloodGroup && (
                      <Badge variant="secondary">{selectedPatient.bloodGroup}</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Contact Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedPatient.phone}
                      </div>
                      {selectedPatient.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {selectedPatient.email}
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        <span>{selectedPatient.address}</span>
                      </div>
                    </div>
                  </div>

                  {(selectedPatient.emergencyContact || selectedPatient.emergencyPhone) && (
                    <div>
                      <h3 className="font-semibold mb-2">Emergency Contact</h3>
                      <div className="space-y-1 text-sm">
                        {selectedPatient.emergencyContact && (
                          <p>Name: {selectedPatient.emergencyContact}</p>
                        )}
                        {selectedPatient.emergencyPhone && (
                          <p>Phone: {selectedPatient.emergencyPhone}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedPatient.allergies && (
                    <div>
                      <h3 className="font-semibold mb-2 text-destructive">Allergies</h3>
                      <p className="text-sm text-destructive">{selectedPatient.allergies}</p>
                    </div>
                  )}

                  {selectedPatient.medicalHistory && (
                    <div>
                      <h3 className="font-semibold mb-2">Medical History</h3>
                      <p className="text-sm">{selectedPatient.medicalHistory}</p>
                    </div>
                  )}

                  {selectedPatient.insurance?.provider && (
                    <div>
                      <h3 className="font-semibold mb-2">Insurance</h3>
                      <div className="text-sm space-y-1">
                        <p>Provider: {selectedPatient.insurance.provider}</p>
                        <p>Policy: {selectedPatient.insurance.policyNumber}</p>
                        <p>Valid Until: {selectedPatient.insurance.validUntil}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Registered on {new Date(selectedPatient.registrationDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}