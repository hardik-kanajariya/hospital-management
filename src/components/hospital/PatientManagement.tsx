import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

export default function PatientManagement() {
  const [patients, setPatients] = useKV<Patient[]>('hospital-patients', [])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Patient>>({
    gender: 'male',
    allergies: [],
    chronicConditions: [],
    vaccinationRecords: []
  })
  
  // State for chronic conditions and vaccinations
  const [newCondition, setNewCondition] = useState<Partial<ChronicCondition>>({})
  const [newVaccination, setNewVaccination] = useState<Partial<VaccinationRecord>>({})
  const [newAllergy, setNewAllergy] = useState('')

  // Filter patients based on search
  const filteredPatients = patients.filter(patient =>
    patient.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phoneNumber?.includes(searchTerm) ||
    patient.mrNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddPatient = () => {
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.phoneNumber || !formData.address) {
      toast.error('Please fill in all required fields')
    setSelec
    }

    const newPatient: Patient = {
    setIsViewDialogOpen()

  const addAllergy = () => {
    
    if (!allergies.includes(newAllergy.t
        ...formData,
      })
    setNewAllergy('')

  const removeAllergy = (allergy: string) => {
      ...formData
    })

  const 
      toast.error('Please fill in all 
    }
    const condition: ChronicCondition = {
      condition: newCondition.condition,
      severity: newCondition.severity,
      lastReviewDate: newCondition.lastRev
    }
    s

    setNewCondition({})

  const removeChronicConditio
      ...formData,
  }

  const addVaccinationRecor
      toast.error
    }
    const vaccinatio
      vaccineName: newVaccin
      batchNumber: newVaccin
      
    }
    setFormData({
      vaccinationReco
   

  const removeVaccinationRecord = (vaccinationId: s
      ...formData,
    })

   

          <Search className="absolute
            placeholder="Search 

          />
        
          <DialogTrigger asChild>
              <Plus className="h-4 w-4" />
            <
       
     
              <
                {selectedPat
            </DialogHeader>
            <Tabs defaultValue="basic" className=
   

              </TabsList>
              <TabsContent valu
                <div classNam
   

  // Add allergy
                    />
    if (!newAllergy.trim()) return
    
    const allergies = formData.allergies || []
    if (!allergies.includes(newAllergy.trim())) {
      setFormData({

        allergies: [...allergies, newAllergy.trim()]
        
    }
                     
  }

  // Remove allergy
                      </SelectTrigger>
    setFormData({
      ...formData,
      allergies: (formData.allergies || []).filter(a => a !== allergy)
      
  }

  // Add chronic condition
  const addChronicCondition = () => {
    if (!newCondition.condition || !newCondition.diagnosedDate || !newCondition.severity) {
      toast.error('Please fill in all condition fields')
      return
     

                    />
      id: crypto.randomUUID(),
                <div className="space-y-
      diagnosedDate: newCondition.diagnosedDate,
                      <SelectValue pla
      medications: newCondition.medications || [],
      lastReviewDate: newCondition.lastReviewDate || new Date().toISOString().split('T')[0],
      notes: newCondition.notes
     

    setFormData({
      ...formData,
      chronicConditions: [...(formData.chronicConditions || []), condition]
    })
                      <
  }

  // Remove chronic condition
  const removeChronicCondition = (conditionId: string) => {
    setFormData({
                  
      chronicConditions: (formData.chronicConditions || []).filter(c => c.id !== conditionId)
    })
  }

  // Add vaccination record
  const addVaccinationRecord = () => {
    if (!newVaccination.vaccineName || !newVaccination.dateAdministered || !newVaccination.administeredBy) {
      toast.error('Please fill in all vaccination fields')
      return
     

    const vaccination: VaccinationRecord = {
      id: crypto.randomUUID(),
      vaccineName: newVaccination.vaccineName,
      dateAdministered: newVaccination.dateAdministered,
      batchNumber: newVaccination.batchNumber || '',
      administeredBy: newVaccination.administeredBy,
      nextDueDate: newVaccination.nextDueDate,
      notes: newVaccination.notes
     

                 
                  
      vaccinationRecords: [...(formData.vaccinationRecords || []), vaccination]
      
    setNewVaccination({})
  }

  // Remove vaccination record
  const removeVaccinationRecord = (vaccinationId: string) => {
    setFormData({
      ...formData,
      vaccinationRecords: (formData.vaccinationRecords || []).filter(v => v.id !== vaccinationId)
    })
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
            
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        onChange=
            <Button className="flex items-center gap-2">
                        placeholder="Polic
              Add New Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedPatient ? 'Edit Patient' : 'Register New Patient'}
              </DialogTitle>
              <DialogDescription>
                {selectedPatient ? 'Update patient information' : 'Enter patient details to register them in the system'}
              </DialogDescription>
                          .
            
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="medical">Medical History</TabsTrigger>
                <TabsTrigger value="allergies">Allergies</TabsTrigger>
                <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
                        p

              <TabsContent value="basic" className="space-y-4">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName || ''}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      placeholder="Enter first name"
                      
                  </div>
                          onChange={(e) => se
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName || ''}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth || ''}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                            <div class
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                            {
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber || ''}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      placeholder="Enter phone number"
                    <I
                  </div>
                      className="flex-1"
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="Enter email address"
                      
                  </div>
                      

                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select value={formData.bloodGroup} onValueChange={(value) => setFormData({...formData, bloodGroup: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                </div>
                      <SelectItem value="A+">A+</SelectItem>
                <div className="space-y-4">
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Address */}
                    <div className="grid gr
                  <h3 className="font-semibold">Address Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Street Address *</Label>
                      <Input
                        id="street"
                        value={formData.address?.street || ''}
                        onChange={(e) => setFormData({
                          ...formData, 
                          address: { ...formData.address, street: e.target.value } as any
                        })}
                          onChange={(e) => setNewVaccinati
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                    <Button onCli
                        value={formData.address?.city || ''}
                        onChange={(e) => setFormData({
                          ...formData, 
                          address: { ...formData.address, city: e.target.value } as any
                        })}
                        placeholder="Enter city"
                      />
                          
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                              <p className="text-sm text-mut
                      <Input
                            )}
                        value={formData.address?.state || ''}
                        onChange={(e) => setFormData({
                          ...formData, 
                          address: { ...formData.address, state: e.target.value } as any
                        })}
                        placeholder="Enter state"
                      />
                      <Syr
                    <div className="space-y-2">
                      <Label htmlFor="pinCode">PIN Code *</Label>
                      <Input
            <div className="flex jus
                        value={formData.address?.pinCode || ''}
                setSelectedPatient(null)
                          ...formData, 
                          address: { ...formData.address, pinCode: e.target.value } as any
                        })}
          </DialogContent>
                      />
      {/* Stats Cards */}
                  </div>
            <CardTitle

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Emergency Contact</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyName">Contact Name</Label>
                      <Input
                        id="emergencyName"
        <Card>
                        onChange={(e) => setFormData({
                          ...formData, 
                          emergencyContact: { ...formData.emergencyContact, name: e.target.value } as any
                        })}
                        placeholder="Emergency contact name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyRelationship">Relationship</Label>
            </div>
                        id="emergencyRelationship"
                        value={formData.emergencyContact?.relationship || ''}
                        onChange={(e) => setFormData({
                          ...formData, 
                          emergencyContact: { ...formData.emergencyContact, relationship: e.target.value } as any
                        })}
                        placeholder="Relationship"
              <div class
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">Phone Number</Label>
                      <Input
                        id="emergencyPhone"
                        value={formData.emergencyContact?.phoneNumber || ''}
                        onChange={(e) => setFormData({
                          ...formData, 
                          emergencyContact: { ...formData.emergencyContact, phoneNumber: e.target.value } as any
                        <h3
                        placeholder="Emergency phone number"
                        
                    </div>
                        
                </div>

                {/* Insurance Information */}
                          </span>
                  <h3 className="font-semibold">Insurance Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                      <Input
                        id="insuranceProvider"
                        value={formData.insuranceInfo?.provider || ''}
                        {patient.insuranceInfo?.provid
                          ...formData, 
                          insuranceInfo: { ...formData.insuranceInfo, provider: e.target.value } as any
                        })}
                        placeholder="Insurance provider name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="policyNumber">Policy Number</Label>
                      <Input
            )}
                        value={formData.insuranceInfo?.policyNumber || ''}
                        onChange={(e) => setFormData({
                          ...formData, 
                          insuranceInfo: { ...formData.insuranceInfo, policyNumber: e.target.value } as any
                        })}
                        placeholder="Policy number"
                      />
                <div class
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                  </div>
                        type="date"
                        value={formData.insuranceInfo?.expiryDate || ''}
                        onChange={(e) => setFormData({
                          ...formData, 
                          insuranceInfo: { ...formData.insuranceInfo, expiryDate: e.target.value } as any

                      />
                      <div
                    <div className="space-y-2">
                      <Label htmlFor="coverageAmount">Coverage Amount</Label>
                      <Input
                      <div>
                        type="number"
                        value={formData.insuranceInfo?.coverageAmount || ''}
                        onChange={(e) => setFormData({
                          ...formData, 
                          insuranceInfo: { ...formData.insuranceInfo, coverageAmount: Number(e.target.value) } as any
                        })}
                        placeholder="Coverage amount"

                    </div>
                        <div className="text-sm
                      <Label htmlFor="copayAmount">Copay Amount</Label>
                            
                        id="copayAmount"
                          </div>
                        value={formData.insuranceInfo?.copayAmount || ''}
                      {selectedPatient.emergencyContac
                          ...formData, 
                          insuranceInfo: { ...formData.insuranceInfo, copayAmount: Number(e.target.value) } as any
                        })}
                        placeholder="Copay amount"
                      />
                    </div>
                  </div>
                    <d
              </TabsContent>

              <TabsContent value="medical" className="space-y-4">
                              condition.sev
                  <h3 className="font-semibold">Chronic Conditions</h3>
                  
                  {/* Add Chronic Condition Form */}
                  <div className="p-4 border rounded-lg bg-muted/20">
                    <h4 className="font-medium mb-3">Add New Condition</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label>Condition Name</Label>
                        <Input
                          value={newCondition.condition || ''}
                          onChange={(e) => setNewCondition({...newCondition, condition: e.target.value})}
                      <h3 className="font-semibold text-destructive"
                        />
                            
                      <div className="space-y-2">
                        <Label>Diagnosed Date</Label>
                        <Input
                          type="date"
                          value={newCondition.diagnosedDate || ''}
                          onChange={(e) => setNewCondition({...newCondition, diagnosedDate: e.target.value})}
                        />
                    </div>
                <TabsConte
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label>Severity</Label>
                        <Select 
                          value={newCondition.severity} 
                          onValueChange={(value) => setNewCondition({...newCondition, severity: value as any})}
                         
                          <SelectTrigger>
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mild">Mild</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="severe">Severe</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                            <p>{selectedPatient.insuran
                        <Input
                            <p>₹{sele
                          value={newCondition.lastReviewDate || ''}
                          onChange={(e) => setNewCondition({...newCondition, lastReviewDate: e.target.value})}
                        />
                      </div>
                        </
                    <div className="space-y-2 mb-4">
                      <Label>Notes</Label>
                      <p>No ins
                        value={newCondition.notes || ''}
                        onChange={(e) => setNewCondition({...newCondition, notes: e.target.value})}
                        placeholder="Additional notes about the condition"
              <div className="te
                      />
                    </div>
                    <Button onClick={addChronicCondition} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Condition
}
                  </div>

                  {/* Existing Chronic Conditions */}

                    <div className="space-y-2">
                      <h4 className="font-medium">Current Conditions</h4>
                      {formData.chronicConditions.map((condition) => (
                        <div key={condition.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{condition.condition}</span>
                              <Badge variant={
                                condition.severity === 'severe' ? 'destructive' : 
                                condition.severity === 'moderate' ? 'default' : 'secondary'
                              }>

                              </Badge>

                            <p className="text-sm text-muted-foreground">
                              Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}
                            </p>
                            {condition.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{condition.notes}</p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeChronicCondition(condition.id)}

                            <X className="w-4 h-4" />

                        </div>

                    </div>

                </div>


              <TabsContent value="allergies" className="space-y-4">
                <div className="space-y-4">

                  

                  <div className="flex gap-2">
                    <Input
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      placeholder="Enter allergy (e.g., Penicillin, Peanuts)"

                    />

                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Current Allergies */}
                  {formData.allergies && formData.allergies.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Current Allergies</h4>
                      <div className="flex flex-wrap gap-2">

                          <Badge key={index} variant="destructive" className="flex items-center gap-1">
                            <Warning className="w-3 h-3" />
                            {allergy}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => removeAllergy(allergy)}
                            >
                              <X className="w-3 h-3" />
                            </Button>

                        ))}

                    </div>


                  {(!formData.allergies || formData.allergies.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="mx-auto h-12 w-12 mb-2" />
                      <p>No allergies recorded</p>

                  )}

              </TabsContent>

              <TabsContent value="vaccinations" className="space-y-4">

                  <h3 className="font-semibold">Vaccination Records</h3>

                  {/* Add Vaccination Form */}
                  <div className="p-4 border rounded-lg bg-muted/20">
                    <h4 className="font-medium mb-3">Add New Vaccination</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">

                        <Input
                          value={newVaccination.vaccineName || ''}
                          onChange={(e) => setNewVaccination({...newVaccination, vaccineName: e.target.value})}
                          placeholder="e.g., COVID-19, Hepatitis B"
                        />

                      <div className="space-y-2">
                        <Label>Date Administered</Label>
                        <Input
                          type="date"
                          value={newVaccination.dateAdministered || ''}
                          onChange={(e) => setNewVaccination({...newVaccination, dateAdministered: e.target.value})}
                        />

                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">

                        <Input
                          value={newVaccination.batchNumber || ''}
                          onChange={(e) => setNewVaccination({...newVaccination, batchNumber: e.target.value})}
                          placeholder="Vaccine batch number"
                        />

                      <div className="space-y-2">
                        <Label>Administered By</Label>
                        <Input
                          value={newVaccination.administeredBy || ''}
                          onChange={(e) => setNewVaccination({...newVaccination, administeredBy: e.target.value})}

                        />

                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">

                        <Input
                          type="date"
                          value={newVaccination.nextDueDate || ''}
                          onChange={(e) => setNewVaccination({...newVaccination, nextDueDate: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Input
                          value={newVaccination.notes || ''}
                          onChange={(e) => setNewVaccination({...newVaccination, notes: e.target.value})}

                        />

                    </div>
                    <Button onClick={addVaccinationRecord} size="sm">
                      <Syringe className="w-4 h-4 mr-2" />

                    </Button>


                  {/* Existing Vaccination Records */}
                  {formData.vaccinationRecords && formData.vaccinationRecords.length > 0 && (

                      <h4 className="font-medium">Vaccination History</h4>
                      {formData.vaccinationRecords.map((vaccination) => (
                        <div key={vaccination.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Syringe className="w-4 h-4 text-primary" />
                              <span className="font-medium">{vaccination.vaccineName}</span>
                              {vaccination.nextDueDate && new Date(vaccination.nextDueDate) > new Date() && (
                                <Badge variant="outline">Due: {new Date(vaccination.nextDueDate).toLocaleDateString()}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Administered: {new Date(vaccination.dateAdministered).toLocaleDateString()} by {vaccination.administeredBy}

                            {vaccination.batchNumber && (
                              <p className="text-sm text-muted-foreground">Batch: {vaccination.batchNumber}</p>

                            {vaccination.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{vaccination.notes}</p>
                            )}
                          </div>

                            variant="outline"

                            onClick={() => removeVaccinationRecord(vaccination.id)}

                            <X className="w-4 h-4" />

                        </div>

                    </div>


                  {(!formData.vaccinationRecords || formData.vaccinationRecords.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Syringe className="mx-auto h-12 w-12 mb-2" />
                      <p>No vaccination records found</p>

                  )}

              </TabsContent>


            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => {

                resetForm()

              }}>

              </Button>

                {selectedPatient ? 'Update Patient' : 'Register Patient'}

            </div>

        </Dialog>



      <div className="grid gap-4 md:grid-cols-4">

          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
          </CardContent>

        

          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Registrations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />

          <CardContent>

              {patients.filter(p => p.createdAt.split('T')[0] === new Date().toISOString().split('T')[0]).length}

          </CardContent>



          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Allergies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />

          <CardContent>

              {patients.filter(p => p.allergies && p.allergies.length > 0).length}

          </CardContent>



          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chronic Conditions</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />

          <CardContent>

              {patients.filter(p => p.chronicConditions && p.chronicConditions.length > 0).length}

          </CardContent>

      </div>

      {/* Patients List */}

        <CardHeader>
          <CardTitle>Patient Registry</CardTitle>
          <CardDescription>

          </CardDescription>

        <CardContent>

            {filteredPatients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No patients found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start by registering your first patient'}
                </p>

            ) : (
              filteredPatients.map((patient) => {
                const fullName = `${patient.firstName} ${patient.lastName}`;
                const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
                

                <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-medium">
                      {patient.firstName?.charAt(0)?.toUpperCase() || 'P'}{patient.lastName?.charAt(0)?.toUpperCase() || ''}
                    </div>

                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{fullName}</h3>
                        <Badge variant="outline">{patient.mrNumber}</Badge>

                          <Badge variant="secondary">{patient.bloodGroup}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Age {age} • {patient.gender}</span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {patient.phoneNumber}
                        </span>
                        {patient.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {patient.email}

                        )}

                      <div className="flex items-center gap-4 text-sm">
                        {patient.allergies && patient.allergies.length > 0 && (
                          <div className="flex items-center gap-1 text-destructive">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Allergies: {patient.allergies.length}</span>

                        )}
                        {patient.chronicConditions && patient.chronicConditions.length > 0 && (
                          <div className="flex items-center gap-1 text-orange-600">
                            <Heart className="h-3 w-3" />
                            <span>Conditions: {patient.chronicConditions.length}</span>


                        {patient.insuranceInfo?.provider && (
                          <Badge variant="outline" className="text-xs">
                            {patient.insuranceInfo.provider}
                          </Badge>
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
                );
              });
            )}

        </CardContent>



      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>

            <DialogDescription>Complete patient information and medical history</DialogDescription>

          

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-medium">
                  {selectedPatient.firstName?.charAt(0)?.toUpperCase() || 'P'}{selectedPatient.lastName?.charAt(0)?.toUpperCase() || ''}
                </div>

                  <h2 className="text-2xl font-bold">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>MR: {selectedPatient.mrNumber}</span>
                    <span>Age: {new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear()}</span>
                    <span>Gender: {selectedPatient.gender}</span>

                      <Badge variant="secondary">{selectedPatient.bloodGroup}</Badge>

                  </div>

              </div>

              <Tabs defaultValue="basic" className="w-full">

                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="medical">Medical History</TabsTrigger>
                  <TabsTrigger value="allergies">Allergies</TabsTrigger>
                  <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
                  <TabsTrigger value="insurance">Insurance</TabsTrigger>


                <TabsContent value="basic" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Personal Information</h3>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Date of Birth:</span> {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</p>
                          <p><span className="font-medium">Blood Group:</span> {selectedPatient.bloodGroup || 'Not specified'}</p>

                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Contact Information</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />

                          </div>

                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {selectedPatient.email}

                          )}
                        </div>
                      </div>


                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Address</h3>
                        <div className="text-sm">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5" />

                              <p>{selectedPatient.address?.street}</p>
                              <p>{selectedPatient.address?.city}, {selectedPatient.address?.state}</p>
                              <p>{selectedPatient.address?.pinCode}</p>

                          </div>

                      </div>

                      {selectedPatient.emergencyContact?.name && (

                          <h3 className="font-semibold mb-2">Emergency Contact</h3>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Name:</span> {selectedPatient.emergencyContact.name}</p>
                            <p><span className="font-medium">Relationship:</span> {selectedPatient.emergencyContact.relationship}</p>
                            <p><span className="font-medium">Phone:</span> {selectedPatient.emergencyContact.phoneNumber}</p>
                          </div>
                        </div>

                    </div>

                </TabsContent>

                <TabsContent value="medical" className="space-y-4">
                  {selectedPatient.chronicConditions && selectedPatient.chronicConditions.length > 0 ? (
                    <div className="space-y-3">
                      <h3 className="font-semibold">Chronic Conditions</h3>
                      {selectedPatient.chronicConditions.map((condition) => (
                        <div key={condition.id} className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{condition.condition}</h4>
                            <Badge variant={
                              condition.severity === 'severe' ? 'destructive' : 
                              condition.severity === 'moderate' ? 'default' : 'secondary'

                              {condition.severity}


                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}</p>
                            <p>Last Review: {new Date(condition.lastReviewDate).toLocaleDateString()}</p>
                            {condition.notes && <p>Notes: {condition.notes}</p>}
                          </div>
                        </div>

                    </div>

                    <div className="text-center py-8 text-muted-foreground">
                      <Heart className="mx-auto h-12 w-12 mb-2" />
                      <p>No chronic conditions recorded</p>

                  )}


                <TabsContent value="allergies" className="space-y-4">
                  {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (

                      <h3 className="font-semibold text-destructive">Known Allergies</h3>

                        {selectedPatient.allergies.map((allergy, index) => (
                          <Badge key={index} variant="destructive" className="flex items-center gap-1">
                            <Warning className="w-3 h-3" />
                            {allergy}
                          </Badge>

                      </div>

                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="mx-auto h-12 w-12 mb-2" />
                      <p>No allergies recorded</p>
                    </div>

                </TabsContent>

                <TabsContent value="vaccinations" className="space-y-4">
                  {selectedPatient.vaccinationRecords && selectedPatient.vaccinationRecords.length > 0 ? (
                    <div className="space-y-3">
                      <h3 className="font-semibold">Vaccination History</h3>
                      {selectedPatient.vaccinationRecords.map((vaccination) => (
                        <div key={vaccination.id} className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Syringe className="w-4 h-4 text-primary" />
                            <h4 className="font-medium">{vaccination.vaccineName}</h4>
                            {vaccination.nextDueDate && new Date(vaccination.nextDueDate) > new Date() && (
                              <Badge variant="outline">Next Due: {new Date(vaccination.nextDueDate).toLocaleDateString()}</Badge>

                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Administered: {new Date(vaccination.dateAdministered).toLocaleDateString()}</p>
                            <p>Administered by: {vaccination.administeredBy}</p>
                            {vaccination.batchNumber && <p>Batch: {vaccination.batchNumber}</p>}

                          </div>
                        </div>
                      ))}

                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Syringe className="mx-auto h-12 w-12 mb-2" />
                      <p>No vaccination records found</p>
                    </div>

                </TabsContent>

                <TabsContent value="insurance" className="space-y-4">

                    <div className="space-y-4">
                      <h3 className="font-semibold">Insurance Information</h3>
                      <div className="p-4 border rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Provider</p>
                            <p>{selectedPatient.insuranceInfo.provider}</p>

                          <div>
                            <p className="font-medium">Policy Number</p>
                            <p>{selectedPatient.insuranceInfo.policyNumber}</p>

                          <div>
                            <p className="font-medium">Coverage Amount</p>
                            <p>₹{selectedPatient.insuranceInfo.coverageAmount?.toLocaleString()}</p>

                          <div>
                            <p className="font-medium">Copay Amount</p>
                            <p>₹{selectedPatient.insuranceInfo.copayAmount?.toLocaleString()}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="font-medium">Valid Until</p>
                            <p>{new Date(selectedPatient.insuranceInfo.expiryDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center py-8 text-muted-foreground">
                      <UserCircle className="mx-auto h-12 w-12 mb-2" />
                      <p>No insurance information available</p>

                  )}

              </Tabs>

              <Separator />

              <div className="text-sm text-muted-foreground">
                <p>Patient registered on {new Date(selectedPatient.createdAt).toLocaleDateString()}</p>
                {selectedPatient.updatedAt !== selectedPatient.createdAt && (
                  <p>Last updated on {new Date(selectedPatient.updatedAt).toLocaleDateString()}</p>
                )}

            </div>

        </DialogContent>

    </div>

}