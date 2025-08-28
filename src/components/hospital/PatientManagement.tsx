import React, { useState, useEffect } from 'react'
import { usePatients } from '@/hooks/useDatabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import {
  Users,
  Plus,
  MagnifyingGlass,
  PencilSimple,
  Eye,
  Calendar,
  Phone,
  Envelope,
  MapPin,
  Heart,
  Shield,
  FileText,
  Pulse,
  Pill,
  Warning,
  CloudArrowUp,
  WifiSlash,
  Syringe,
  User
} from '@phosphor-icons/react'

interface Patient {
  id: string
  patient_id: string
  name: string
  email?: string
  phone: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other'
  address: string
  emergency_contact: string
  blood_group?: string
  allergies: string[]
  chronic_conditions: string[]
  vaccination_records: VaccinationRecord[]
  insurance_info?: InsuranceInfo
  created_at: string
  updated_at: string
  synced?: boolean
  local_changes?: boolean
}

interface VaccinationRecord {
  vaccine_name: string
  date_administered: string
  next_due_date?: string
  administered_by: string
}

interface InsuranceInfo {
  provider: string
  policy_number: string
  coverage_amount: number
  expiry_date: string
}

export default function PatientManagement() {
  const { patients, loading, error, addPatient, updatePatient, deletePatient, refreshPatients } = usePatients()
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    phone: '',
    email: '',
    date_of_birth: '',
    gender: 'male',
    address: '',
    emergency_contact: '',
    blood_group: '',
    allergies: [],
    chronic_conditions: [],
    vaccination_records: [],
    insurance_info: undefined
  })

  // Filter patients based on search
  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm) ||
    patient.patient_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (selectedPatient) {
        await updatePatient(selectedPatient.id, formData)
        toast.success('Patient updated successfully')
      } else {
        await addPatient({
          ...formData,
          name: formData.name || '',
          phone: formData.phone || '',
          date_of_birth: formData.date_of_birth || '',
          gender: formData.gender || 'male',
          address: formData.address || '',
          emergency_contact: formData.emergency_contact || '',
          allergies: formData.allergies || [],
          chronic_conditions: formData.chronic_conditions || [],
          vaccination_records: formData.vaccination_records || []
        })
        toast.success('Patient created successfully')
      }

      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      toast.error('Failed to save patient')
      console.error('Error saving patient:', error)
    }
  }

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient)
    setFormData(patient)
    setIsDialogOpen(true)
  }

  const handleDelete = async (patient: Patient) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await deletePatient(patient.id)
        toast.success('Patient deleted successfully')
      } catch (error) {
        toast.error('Failed to delete patient')
        console.error('Error deleting patient:', error)
      }
    }
  }

  const handleView = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsViewDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      date_of_birth: '',
      gender: 'male',
      address: '',
      emergency_contact: '',
      blood_group: '',
      allergies: [],
      chronic_conditions: [],
      vaccination_records: []
    })
    setSelectedPatient(null)
  }

  const addAllergy = () => {
    setFormData(prev => ({
      ...prev,
      allergies: [...(prev.allergies || []), '']
    }))
  }

  const updateAllergy = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies?.map((allergy, i) => i === index ? value : allergy) || []
    }))
  }

  const removeAllergy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies?.filter((_, i) => i !== index) || []
    }))
  }

  const addChronicCondition = () => {
    setFormData(prev => ({
      ...prev,
      chronic_conditions: [...(prev.chronic_conditions || []), '']
    }))
  }

  const updateChronicCondition = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      chronic_conditions: prev.chronic_conditions?.map((condition, i) => i === index ? value : condition) || []
    }))
  }

  const removeChronicCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      chronic_conditions: prev.chronic_conditions?.filter((_, i) => i !== index) || []
    }))
  }

  const addVaccination = () => {
    setFormData(prev => ({
      ...prev,
      vaccination_records: [...(prev.vaccination_records || []), {
        vaccine_name: '',
        date_administered: '',
        next_due_date: '',
        administered_by: ''
      }]
    }))
  }

  const updateVaccination = (index: number, field: keyof VaccinationRecord, value: string) => {
    setFormData(prev => ({
      ...prev,
      vaccination_records: prev.vaccination_records?.map((vaccination, i) =>
        i === index ? { ...vaccination, [field]: value } : vaccination
      ) || []
    }))
  }

  const removeVaccination = (index: number) => {
    setFormData(prev => ({
      ...prev,
      vaccination_records: prev.vaccination_records?.filter((_, i) => i !== index) || []
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header with sync status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Patient Management</h1>
          </div>

          {/* Sync Status */}
          <div className="flex items-center gap-2">
            {patients.isOnline ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CloudArrowUp className="w-3 h-3 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                <WifiSlash className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}

            {patients.syncing && (
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                <Pulse className="w-3 h-3 mr-1 animate-spin" />
                Syncing
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={refreshPatients}
            disabled={loading}
          >
            <CloudArrowUp className="w-4 h-4 mr-2" />
            Sync Now
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedPatient ? 'Edit Patient' : 'Add New Patient'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="medical">Medical Info</TabsTrigger>
                    <TabsTrigger value="vaccination">Vaccinations</TabsTrigger>
                    <TabsTrigger value="insurance">Insurance</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={formData.phone || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="dob">Date of Birth *</Label>
                        <Input
                          id="dob"
                          type="date"
                          value={formData.date_of_birth || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="gender">Gender *</Label>
                        <Select
                          value={formData.gender}
                          onValueChange={(value: 'male' | 'female' | 'other') =>
                            setFormData(prev => ({ ...prev, gender: value }))
                          }
                        >
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

                      <div>
                        <Label htmlFor="blood_group">Blood Group</Label>
                        <Select
                          value={formData.blood_group || ''}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, blood_group: value }))}
                        >
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

                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Textarea
                        id="address"
                        value={formData.address || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="emergency_contact">Emergency Contact *</Label>
                      <Input
                        id="emergency_contact"
                        value={formData.emergency_contact || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                        placeholder="Name - Relationship - Phone"
                        required
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="medical" className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Allergies</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addAllergy}>
                          <Plus className="w-3 h-3 mr-1" />
                          Add Allergy
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {formData.allergies?.map((allergy, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={allergy}
                              onChange={(e) => updateAllergy(index, e.target.value)}
                              placeholder="Enter allergy"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeAllergy(index)}
                            >
                              <Warning className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Chronic Conditions</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addChronicCondition}>
                          <Plus className="w-3 h-3 mr-1" />
                          Add Condition
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {formData.chronic_conditions?.map((condition, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={condition}
                              onChange={(e) => updateChronicCondition(index, e.target.value)}
                              placeholder="Enter chronic condition"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeChronicCondition(index)}
                            >
                              <Warning className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="vaccination" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Vaccination Records</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addVaccination}>
                        <Syringe className="w-3 h-3 mr-1" />
                        Add Vaccination
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {formData.vaccination_records?.map((vaccination, index) => (
                        <Card key={index} className="p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Vaccine Name</Label>
                              <Input
                                value={vaccination.vaccine_name}
                                onChange={(e) => updateVaccination(index, 'vaccine_name', e.target.value)}
                                placeholder="e.g., COVID-19, Hepatitis B"
                              />
                            </div>

                            <div>
                              <Label>Date Administered</Label>
                              <Input
                                type="date"
                                value={vaccination.date_administered}
                                onChange={(e) => updateVaccination(index, 'date_administered', e.target.value)}
                              />
                            </div>

                            <div>
                              <Label>Next Due Date</Label>
                              <Input
                                type="date"
                                value={vaccination.next_due_date || ''}
                                onChange={(e) => updateVaccination(index, 'next_due_date', e.target.value)}
                              />
                            </div>

                            <div>
                              <Label>Administered By</Label>
                              <Input
                                value={vaccination.administered_by}
                                onChange={(e) => updateVaccination(index, 'administered_by', e.target.value)}
                                placeholder="Doctor/Nurse name"
                              />
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="mt-2"
                            onClick={() => removeVaccination(index)}
                          >
                            Remove
                          </Button>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="insurance" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Insurance Provider</Label>
                        <Input
                          value={formData.insurance_info?.provider || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            insurance_info: {
                              ...prev.insurance_info,
                              provider: e.target.value,
                              policy_number: prev.insurance_info?.policy_number || '',
                              coverage_amount: prev.insurance_info?.coverage_amount || 0,
                              expiry_date: prev.insurance_info?.expiry_date || ''
                            }
                          }))}
                          placeholder="e.g., Star Health, HDFC ERGO"
                        />
                      </div>

                      <div>
                        <Label>Policy Number</Label>
                        <Input
                          value={formData.insurance_info?.policy_number || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            insurance_info: {
                              ...prev.insurance_info,
                              provider: prev.insurance_info?.provider || '',
                              policy_number: e.target.value,
                              coverage_amount: prev.insurance_info?.coverage_amount || 0,
                              expiry_date: prev.insurance_info?.expiry_date || ''
                            }
                          }))}
                        />
                      </div>

                      <div>
                        <Label>Coverage Amount</Label>
                        <Input
                          type="number"
                          value={formData.insurance_info?.coverage_amount || 0}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            insurance_info: {
                              ...prev.insurance_info,
                              provider: prev.insurance_info?.provider || '',
                              policy_number: prev.insurance_info?.policy_number || '',
                              coverage_amount: parseFloat(e.target.value) || 0,
                              expiry_date: prev.insurance_info?.expiry_date || ''
                            }
                          }))}
                        />
                      </div>

                      <div>
                        <Label>Expiry Date</Label>
                        <Input
                          type="date"
                          value={formData.insurance_info?.expiry_date || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            insurance_info: {
                              ...prev.insurance_info,
                              provider: prev.insurance_info?.provider || '',
                              policy_number: prev.insurance_info?.policy_number || '',
                              coverage_amount: prev.insurance_info?.coverage_amount || 0,
                              expiry_date: e.target.value
                            }
                          }))}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={patients.loading}>
                    {selectedPatient ? 'Update Patient' : 'Create Patient'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search patients by name, phone, or patient ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Patients List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Patients ({filteredPatients.length})</span>
            {patients.lastSyncTime && (
              <span className="text-sm text-muted-foreground">
                Last sync: {patients.lastSyncTime.toLocaleTimeString()}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patients.loading ? (
            <div className="text-center py-8">
              <Pulse className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>Loading patients...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No patients found</p>
              {searchTerm && <p className="text-sm">Try adjusting your search terms</p>}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.patient_id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        {patient.email && <p className="text-sm text-muted-foreground">{patient.email}</p>}
                      </div>
                    </TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>
                      {patient.date_of_birth ?
                        Math.floor((Date.now() - new Date(patient.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365))
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      {patient.blood_group && (
                        <Badge variant="outline">{patient.blood_group}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {!patient.synced && (
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            <CloudArrowUp className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                        {patient.local_changes && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            Modified
                          </Badge>
                        )}
                        {patient.allergies && patient.allergies.length > 0 && (
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            <Warning className="w-3 h-3 mr-1" />
                            Allergies
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(patient)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(patient)}
                        >
                          <PencilSimple className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(patient)}
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Warning className="w-4 h-4" />
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

      {/* View Patient Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
          </DialogHeader>

          {selectedPatient && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Patient ID</Label>
                      <p className="text-sm">{selectedPatient.patient_id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Full Name</Label>
                      <p className="text-sm">{selectedPatient.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p className="text-sm flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {selectedPatient.phone}
                      </p>
                    </div>
                    {selectedPatient.email && (
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm flex items-center gap-1">
                          <Envelope className="w-3 h-3" />
                          {selectedPatient.email}
                        </p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium">Date of Birth</Label>
                      <p className="text-sm flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(selectedPatient.date_of_birth).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Gender</Label>
                      <p className="text-sm capitalize">{selectedPatient.gender}</p>
                    </div>
                    {selectedPatient.blood_group && (
                      <div>
                        <Label className="text-sm font-medium">Blood Group</Label>
                        <Badge variant="outline">{selectedPatient.blood_group}</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Address</Label>
                      <p className="text-sm">{selectedPatient.address}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Emergency Contact</Label>
                      <p className="text-sm">{selectedPatient.emergency_contact}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {(selectedPatient.allergies.length > 0 || selectedPatient.chronic_conditions.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Medical Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedPatient.allergies.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Allergies</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPatient.allergies.map((allergy, index) => (
                            <Badge key={index} variant="outline" className="text-red-600 border-red-600">
                              <Warning className="w-3 h-3 mr-1" />
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedPatient.chronic_conditions.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Chronic Conditions</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPatient.chronic_conditions.map((condition, index) => (
                            <Badge key={index} variant="outline" className="text-orange-600 border-orange-600">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {selectedPatient.vaccination_records.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Syringe className="w-5 h-5" />
                      Vaccination Records
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedPatient.vaccination_records.map((vaccination, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <Label className="text-xs font-medium">Vaccine</Label>
                              <p>{vaccination.vaccine_name}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium">Date Administered</Label>
                              <p>{new Date(vaccination.date_administered).toLocaleDateString()}</p>
                            </div>
                            {vaccination.next_due_date && (
                              <div>
                                <Label className="text-xs font-medium">Next Due</Label>
                                <p>{new Date(vaccination.next_due_date).toLocaleDateString()}</p>
                              </div>
                            )}
                            <div>
                              <Label className="text-xs font-medium">Administered By</Label>
                              <p>{vaccination.administered_by}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedPatient.insurance_info && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Insurance Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-xs font-medium">Provider</Label>
                        <p>{selectedPatient.insurance_info.provider}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium">Policy Number</Label>
                        <p>{selectedPatient.insurance_info.policy_number}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium">Coverage Amount</Label>
                        <p>₹{selectedPatient.insurance_info.coverage_amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium">Expiry Date</Label>
                        <p>{new Date(selectedPatient.insurance_info.expiry_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {patients.error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <Warning className="w-4 h-4" />
              <p className="text-sm">Error: {patients.error}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}