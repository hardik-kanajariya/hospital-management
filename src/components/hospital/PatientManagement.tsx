import React, { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  Shield,
  FileText,
  Activity,
  Pill,
  Warning
} from '@phosphor-icons/react'

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  address: string
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  }
  medicalHistory: string[]
  allergies: string[]
  vaccinations: Array<{
    vaccine: string
    date: string
    nextDue?: string
  }>
  chronicConditions: string[]
  bloodType: string
  insuranceInfo: {
    provider: string
    policyNumber: string
    groupNumber: string
  }
  createdAt: string
  updatedAt: string
}

const PatientManagement = () => {
  const [patients, setPatients] = useKV<Patient[]>('hospital-patients', [])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)

  // Form state for new/edit patient
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    address: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    medicalHistory: [],
    allergies: [],
    vaccinations: [],
    chronicConditions: [],
    bloodType: '',
    insuranceInfo: {
      provider: '',
      policyNumber: '',
      groupNumber: ''
    }
  })

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  )

  const handleAddPatient = () => {
    if (!formData.name || !formData.phone || !formData.dateOfBirth) {
      toast.error('Please fill in required fields (Name, Phone, Date of Birth)')
      return
    }

    const newPatient: Patient = {
      id: Date.now().toString(),
      ...formData as Patient,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setPatients(currentPatients => [...currentPatients, newPatient])
    setIsAddDialogOpen(false)
    resetForm()
    toast.success('Patient added successfully')
  }

  const handleEditPatient = () => {
    if (!editingPatient || !formData.name || !formData.phone || !formData.dateOfBirth) {
      toast.error('Please fill in required fields')
      return
    }

    setPatients(currentPatients =>
      currentPatients.map(patient =>
        patient.id === editingPatient.id
          ? { ...patient, ...formData, updatedAt: new Date().toISOString() }
          : patient
      )
    )

    setEditingPatient(null)
    resetForm()
    toast.success('Patient updated successfully')
  }

  const handleDeletePatient = (patientId: string) => {
    setPatients(currentPatients => currentPatients.filter(p => p.id !== patientId))
    toast.success('Patient deleted successfully')
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'male',
      address: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      },
      medicalHistory: [],
      allergies: [],
      vaccinations: [],
      chronicConditions: [],
      bloodType: '',
      insuranceInfo: {
        provider: '',
        policyNumber: '',
        groupNumber: ''
      }
    })
  }

  const openEditDialog = (patient: Patient) => {
    setEditingPatient(patient)
    setFormData(patient)
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const addToList = (listName: keyof Pick<Patient, 'medicalHistory' | 'allergies' | 'chronicConditions'>, value: string) => {
    if (!value.trim()) return
    
    setFormData(prev => ({
      ...prev,
      [listName]: [...(prev[listName] || []), value.trim()]
    }))
  }

  const removeFromList = (listName: keyof Pick<Patient, 'medicalHistory' | 'allergies' | 'chronicConditions'>, index: number) => {
    setFormData(prev => ({
      ...prev,
      [listName]: (prev[listName] || []).filter((_, i) => i !== index)
    }))
  }

  const addVaccination = (vaccine: string, date: string, nextDue?: string) => {
    if (!vaccine.trim() || !date) return
    
    setFormData(prev => ({
      ...prev,
      vaccinations: [...(prev.vaccinations || []), { vaccine: vaccine.trim(), date, nextDue }]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Patient Management</h3>
            <p className="text-sm text-muted-foreground">
              Manage patient records and medical information
            </p>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search patients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{patients.length}</div>
                <div className="text-sm text-muted-foreground">Total Patients</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patients List */}
      <div className="grid gap-4">
        {filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Patients Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No patients match your search criteria.' : 'Get started by adding your first patient.'}
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Patient
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center text-lg font-semibold">
                      {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-lg">{patient.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Age {calculateAge(patient.dateOfBirth)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <span>{patient.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>{patient.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{patient.gender}</Badge>
                        {patient.bloodType && (
                          <Badge variant="secondary">{patient.bloodType}</Badge>
                        )}
                        {patient.allergies.length > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            <Warning className="w-3 h-3 mr-1" />
                            Allergies
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPatient(patient)
                        setIsViewDialogOpen(true)
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(patient)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Patient Dialog */}
      <Dialog open={isAddDialogOpen || !!editingPatient} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false)
          setEditingPatient(null)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPatient ? 'Edit Patient' : 'Add New Patient'}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="medical">Medical</TabsTrigger>
              <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
              <TabsTrigger value="insurance">Insurance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Patient full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="patient@email.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1234567890"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value as 'male' | 'female' | 'other' }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select value={formData.bloodType} onValueChange={(value) => setFormData(prev => ({ ...prev, bloodType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
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
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Full address"
                  rows={3}
                />
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Contact Name</Label>
                    <Input
                      value={formData.emergencyContact?.name || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        emergencyContact: { ...prev.emergencyContact!, name: e.target.value }
                      }))}
                      placeholder="Emergency contact name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Relationship</Label>
                    <Input
                      value={formData.emergencyContact?.relationship || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        emergencyContact: { ...prev.emergencyContact!, relationship: e.target.value }
                      }))}
                      placeholder="e.g., Spouse, Parent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input
                      value={formData.emergencyContact?.phone || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        emergencyContact: { ...prev.emergencyContact!, phone: e.target.value }
                      }))}
                      placeholder="Emergency contact phone"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="medical" className="space-y-4">
              {/* Medical History */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Medical History
                </h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add medical condition"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addToList('medicalHistory', e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Add medical condition"]') as HTMLInputElement
                      if (input?.value) {
                        addToList('medicalHistory', input.value)
                        input.value = ''
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.medicalHistory || []).map((condition, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeFromList('medicalHistory', index)}>
                      {condition} ×
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Allergies */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Warning className="w-4 h-4 text-destructive" />
                  Allergies
                </h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add allergy"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addToList('allergies', e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Add allergy"]') as HTMLInputElement
                      if (input?.value) {
                        addToList('allergies', input.value)
                        input.value = ''
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.allergies || []).map((allergy, index) => (
                    <Badge key={index} variant="destructive" className="cursor-pointer" onClick={() => removeFromList('allergies', index)}>
                      {allergy} ×
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Chronic Conditions */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Chronic Conditions
                </h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add chronic condition"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addToList('chronicConditions', e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Add chronic condition"]') as HTMLInputElement
                      if (input?.value) {
                        addToList('chronicConditions', input.value)
                        input.value = ''
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.chronicConditions || []).map((condition, index) => (
                    <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => removeFromList('chronicConditions', index)}>
                      {condition} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="vaccinations" className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Vaccination Records
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Vaccine Name</Label>
                  <Input placeholder="e.g., COVID-19, Flu" id="vaccine-name" />
                </div>
                <div className="space-y-2">
                  <Label>Date Given</Label>
                  <Input type="date" id="vaccine-date" />
                </div>
                <div className="space-y-2">
                  <Label>Next Due (Optional)</Label>
                  <Input type="date" id="vaccine-next" />
                </div>
                <div className="md:col-span-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const name = (document.getElementById('vaccine-name') as HTMLInputElement)?.value
                      const date = (document.getElementById('vaccine-date') as HTMLInputElement)?.value
                      const nextDue = (document.getElementById('vaccine-next') as HTMLInputElement)?.value
                      
                      if (name && date) {
                        addVaccination(name, date, nextDue || undefined)
                        ;(document.getElementById('vaccine-name') as HTMLInputElement).value = ''
                        ;(document.getElementById('vaccine-date') as HTMLInputElement).value = ''
                        ;(document.getElementById('vaccine-next') as HTMLInputElement).value = ''
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vaccination
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                {(formData.vaccinations || []).map((vaccination, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">{vaccination.vaccine}</h5>
                          <p className="text-sm text-muted-foreground">
                            Given: {new Date(vaccination.date).toLocaleDateString()}
                            {vaccination.nextDue && (
                              <span className="ml-4">
                                Next due: {new Date(vaccination.nextDue).toLocaleDateString()}
                              </span>
                            )}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              vaccinations: (prev.vaccinations || []).filter((_, i) => i !== index)
                            }))
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="insurance" className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Insurance Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Insurance Provider</Label>
                  <Input
                    value={formData.insuranceInfo?.provider || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      insuranceInfo: { ...prev.insuranceInfo!, provider: e.target.value }
                    }))}
                    placeholder="Insurance company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Policy Number</Label>
                  <Input
                    value={formData.insuranceInfo?.policyNumber || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      insuranceInfo: { ...prev.insuranceInfo!, policyNumber: e.target.value }
                    }))}
                    placeholder="Policy number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Group Number</Label>
                  <Input
                    value={formData.insuranceInfo?.groupNumber || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      insuranceInfo: { ...prev.insuranceInfo!, groupNumber: e.target.value }
                    }))}
                    placeholder="Group number"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false)
                setEditingPatient(null)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button onClick={editingPatient ? handleEditPatient : handleAddPatient}>
              {editingPatient ? 'Update Patient' : 'Add Patient'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Patient Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Details - {selectedPatient?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedPatient && (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="medical">Medical</TabsTrigger>
                <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
                <TabsTrigger value="insurance">Insurance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xl font-semibold">
                          {selectedPatient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{selectedPatient.name}</h3>
                          <p className="text-muted-foreground">Age {calculateAge(selectedPatient.dateOfBirth)}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            Born {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{selectedPatient.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{selectedPatient.email}</span>
                        </div>
                        {selectedPatient.address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <span className="text-sm">{selectedPatient.address}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Badge variant="outline">{selectedPatient.gender}</Badge>
                        {selectedPatient.bloodType && (
                          <Badge variant="secondary">{selectedPatient.bloodType}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Emergency Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="font-medium">{selectedPatient.emergencyContact.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedPatient.emergencyContact.relationship}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedPatient.emergencyContact.phone}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="medical" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Medical History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedPatient.medicalHistory.length > 0 ? (
                        <div className="space-y-2">
                          {selectedPatient.medicalHistory.map((condition, index) => (
                            <Badge key={index} variant="secondary">{condition}</Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No medical history recorded</p>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Warning className="w-4 h-4 text-destructive" />
                        Allergies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedPatient.allergies.length > 0 ? (
                        <div className="space-y-2">
                          {selectedPatient.allergies.map((allergy, index) => (
                            <Badge key={index} variant="destructive">{allergy}</Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No known allergies</p>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Chronic Conditions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedPatient.chronicConditions.length > 0 ? (
                        <div className="space-y-2">
                          {selectedPatient.chronicConditions.map((condition, index) => (
                            <Badge key={index} variant="outline">{condition}</Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No chronic conditions</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="vaccinations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Vaccination Records
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPatient.vaccinations.length > 0 ? (
                      <div className="space-y-3">
                        {selectedPatient.vaccinations.map((vaccination, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <h5 className="font-medium">{vaccination.vaccine}</h5>
                            <p className="text-sm text-muted-foreground">
                              Given: {new Date(vaccination.date).toLocaleDateString()}
                              {vaccination.nextDue && (
                                <span className="ml-4">
                                  Next due: {new Date(vaccination.nextDue).toLocaleDateString()}
                                </span>
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No vaccination records</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="insurance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Insurance Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Provider</Label>
                      <p className="text-sm">{selectedPatient.insuranceInfo.provider || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Policy Number</Label>
                      <p className="text-sm">{selectedPatient.insuranceInfo.policyNumber || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Group Number</Label>
                      <p className="text-sm">{selectedPatient.insuranceInfo.groupNumber || 'Not specified'}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              if (selectedPatient) {
                openEditDialog(selectedPatient)
                setIsViewDialogOpen(false)
              }
            }}>
              Edit Patient
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PatientManagement