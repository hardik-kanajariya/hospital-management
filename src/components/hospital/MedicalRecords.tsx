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
import { FileText, Plus, Search, Stethoscope, Pill, Activity, Eye } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface MedicalRecord {
  id: string
  patientId: string
  patientName: string
  doctor: string
  date: string
  type: 'consultation' | 'follow-up' | 'emergency' | 'surgery'
  chiefComplaint: string
  symptoms: string
  vitals: {
    temperature: string
    bloodPressure: string
    heartRate: string
    weight: string
    height: string
  }
  diagnosis: string
  treatment: string
  prescriptions: Array<{
    medication: string
    dosage: string
    frequency: string
    duration: string
    instructions: string
  }>
  labTests: Array<{
    test: string
    result: string
    normalRange: string
    status: 'normal' | 'abnormal' | 'pending'
  }>
  followUpDate?: string
  notes: string
  createdAt: string
}

const commonDiagnoses = [
  'Hypertension',
  'Diabetes Type 2',
  'Upper Respiratory Infection',
  'Gastroenteritis',
  'Fever - Unspecified',
  'Headache',
  'Back Pain',
  'Arthritis',
  'Allergic Rhinitis',
  'Urinary Tract Infection'
]

const commonMedications = [
  'Paracetamol 500mg',
  'Ibuprofen 400mg',
  'Amoxicillin 500mg',
  'Metformin 500mg',
  'Amlodipine 5mg',
  'Omeprazole 20mg',
  'Cetirizine 10mg',
  'Aspirin 75mg',
  'Atorvastatin 20mg',
  'Losartan 50mg'
]

const commonLabTests = [
  'Complete Blood Count (CBC)',
  'Blood Sugar (Fasting)',
  'Blood Sugar (Random)',
  'Lipid Profile',
  'Liver Function Test',
  'Kidney Function Test',
  'Thyroid Function Test',
  'Urine Analysis',
  'ECG',
  'Chest X-Ray'
]

export default function MedicalRecords() {
  const [records, setRecords] = useKV('medical-records', [])
  const [patients] = useKV('hospital-patients', [])
  const [appointments] = useKV('hospital-appointments', [])
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const [newRecord, setNewRecord] = useState({
    patientId: '',
    patientName: '',
    doctor: '',
    type: 'consultation' as const,
    chiefComplaint: '',
    symptoms: '',
    vitals: {
      temperature: '',
      bloodPressure: '',
      heartRate: '',
      weight: '',
      height: ''
    },
    diagnosis: '',
    treatment: '',
    followUpDate: '',
    notes: ''
  })

  const [prescriptions, setPrescriptions] = useState([{
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  }])

  const [labTests, setLabTests] = useState([{
    test: '',
    result: '',
    normalRange: '',
    status: 'pending' as const
  }])

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.doctor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.id?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || record.type === filterType
    
    return matchesSearch && matchesType
  })

  const handleAddRecord = () => {
    if (!newRecord.patientId || !newRecord.doctor || !newRecord.chiefComplaint || !newRecord.diagnosis) {
      toast.error('Please fill in all required fields')
      return
    }

    const record: MedicalRecord = {
      id: `MED${Date.now()}`,
      patientId: newRecord.patientId,
      patientName: newRecord.patientName,
      doctor: newRecord.doctor,
      date: new Date().toISOString().split('T')[0],
      type: newRecord.type,
      chiefComplaint: newRecord.chiefComplaint,
      symptoms: newRecord.symptoms,
      vitals: newRecord.vitals,
      diagnosis: newRecord.diagnosis,
      treatment: newRecord.treatment,
      prescriptions: prescriptions.filter(p => p.medication),
      labTests: labTests.filter(t => t.test),
      followUpDate: newRecord.followUpDate,
      notes: newRecord.notes,
      createdAt: new Date().toISOString()
    }

    setRecords(currentRecords => [...currentRecords, record])
    
    // Reset form
    setNewRecord({
      patientId: '',
      patientName: '',
      doctor: '',
      type: 'consultation',
      chiefComplaint: '',
      symptoms: '',
      vitals: {
        temperature: '',
        bloodPressure: '',
        heartRate: '',
        weight: '',
        height: ''
      },
      diagnosis: '',
      treatment: '',
      followUpDate: '',
      notes: ''
    })
    setPrescriptions([{
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }])
    setLabTests([{
      test: '',
      result: '',
      normalRange: '',
      status: 'pending'
    }])
    
    setIsDialogOpen(false)
    toast.success(`Medical record created for ${record.patientName}`)
  }

  const addPrescription = () => {
    setPrescriptions([...prescriptions, {
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }])
  }

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index))
  }

  const updatePrescription = (index: number, field: string, value: string) => {
    const updated = prescriptions.map((prescription, i) => 
      i === index ? { ...prescription, [field]: value } : prescription
    )
    setPrescriptions(updated)
  }

  const addLabTest = () => {
    setLabTests([...labTests, {
      test: '',
      result: '',
      normalRange: '',
      status: 'pending'
    }])
  }

  const removeLabTest = (index: number) => {
    setLabTests(labTests.filter((_, i) => i !== index))
  }

  const updateLabTest = (index: number, field: string, value: string) => {
    const updated = labTests.map((test, i) => 
      i === index ? { ...test, [field]: value } : test
    )
    setLabTests(updated)
  }

  const getRecordTypeBadge = (type: string) => {
    switch (type) {
      case 'consultation':
        return <Badge variant="outline" className="text-blue-600">Consultation</Badge>
      case 'follow-up':
        return <Badge variant="outline" className="text-green-600">Follow-up</Badge>
      case 'emergency':
        return <Badge variant="destructive">Emergency</Badge>
      case 'surgery':
        return <Badge variant="default" className="bg-purple-500">Surgery</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search medical records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="follow-up">Follow-up</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="surgery">Surgery</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Medical Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Medical Record</DialogTitle>
              <DialogDescription>
                Document patient consultation and medical findings.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="clinical">Clinical Notes</TabsTrigger>
                <TabsTrigger value="prescription">Prescription</TabsTrigger>
                <TabsTrigger value="tests">Lab Tests</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Patient *</Label>
                    <Select 
                      onValueChange={(value) => {
                        const patient = patients.find(p => p.id === value)
                        setNewRecord({
                          ...newRecord, 
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
                            {patient.name} - {patient.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Doctor *</Label>
                    <Input
                      value={newRecord.doctor}
                      onChange={(e) => setNewRecord({...newRecord, doctor: e.target.value})}
                      placeholder="Dr. Name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Record Type *</Label>
                    <Select 
                      value={newRecord.type} 
                      onValueChange={(value: any) => setNewRecord({...newRecord, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="surgery">Surgery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Follow-up Date</Label>
                    <Input
                      type="date"
                      value={newRecord.followUpDate}
                      onChange={(e) => setNewRecord({...newRecord, followUpDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Chief Complaint *</Label>
                  <Textarea
                    value={newRecord.chiefComplaint}
                    onChange={(e) => setNewRecord({...newRecord, chiefComplaint: e.target.value})}
                    placeholder="Patient's main complaint or reason for visit"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Symptoms & History</Label>
                  <Textarea
                    value={newRecord.symptoms}
                    onChange={(e) => setNewRecord({...newRecord, symptoms: e.target.value})}
                    placeholder="Detailed symptoms, duration, and relevant medical history"
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="clinical" className="space-y-4">
                {/* Vital Signs */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">Vital Signs</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm">Temperature (°F)</Label>
                      <Input
                        value={newRecord.vitals.temperature}
                        onChange={(e) => setNewRecord({
                          ...newRecord, 
                          vitals: {...newRecord.vitals, temperature: e.target.value}
                        })}
                        placeholder="98.6"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm">Blood Pressure</Label>
                      <Input
                        value={newRecord.vitals.bloodPressure}
                        onChange={(e) => setNewRecord({
                          ...newRecord, 
                          vitals: {...newRecord.vitals, bloodPressure: e.target.value}
                        })}
                        placeholder="120/80"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm">Heart Rate (bpm)</Label>
                      <Input
                        value={newRecord.vitals.heartRate}
                        onChange={(e) => setNewRecord({
                          ...newRecord, 
                          vitals: {...newRecord.vitals, heartRate: e.target.value}
                        })}
                        placeholder="72"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm">Weight (kg)</Label>
                      <Input
                        value={newRecord.vitals.weight}
                        onChange={(e) => setNewRecord({
                          ...newRecord, 
                          vitals: {...newRecord.vitals, weight: e.target.value}
                        })}
                        placeholder="70"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm">Height (cm)</Label>
                      <Input
                        value={newRecord.vitals.height}
                        onChange={(e) => setNewRecord({
                          ...newRecord, 
                          vitals: {...newRecord.vitals, height: e.target.value}
                        })}
                        placeholder="170"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Diagnosis *</Label>
                  <Input
                    value={newRecord.diagnosis}
                    onChange={(e) => setNewRecord({...newRecord, diagnosis: e.target.value})}
                    placeholder="Primary diagnosis"
                    list="diagnoses"
                  />
                  <datalist id="diagnoses">
                    {commonDiagnoses.map(diagnosis => (
                      <option key={diagnosis} value={diagnosis} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <Label>Treatment Plan</Label>
                  <Textarea
                    value={newRecord.treatment}
                    onChange={(e) => setNewRecord({...newRecord, treatment: e.target.value})}
                    placeholder="Treatment plan, recommendations, and instructions"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                    placeholder="Additional clinical notes, observations, or comments"
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="prescription" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Medications</Label>
                  <Button variant="outline" size="sm" onClick={addPrescription}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Medication
                  </Button>
                </div>

                {prescriptions.map((prescription, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-sm">Medication</Label>
                        <Input
                          value={prescription.medication}
                          onChange={(e) => updatePrescription(index, 'medication', e.target.value)}
                          placeholder="Medication name"
                          list="medications"
                        />
                        <datalist id="medications">
                          {commonMedications.map(med => (
                            <option key={med} value={med} />
                          ))}
                        </datalist>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">Dosage</Label>
                        <Input
                          value={prescription.dosage}
                          onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                          placeholder="500mg"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">Frequency</Label>
                        <Input
                          value={prescription.frequency}
                          onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                          placeholder="Twice daily"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">Duration</Label>
                        <Input
                          value={prescription.duration}
                          onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                          placeholder="7 days"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-sm">Instructions</Label>
                        <div className="flex gap-2">
                          <Input
                            value={prescription.instructions}
                            onChange={(e) => updatePrescription(index, 'instructions', e.target.value)}
                            placeholder="Take with food, avoid alcohol"
                            className="flex-1"
                          />
                          {prescriptions.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removePrescription(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="tests" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Laboratory Tests</Label>
                  <Button variant="outline" size="sm" onClick={addLabTest}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Test
                  </Button>
                </div>

                {labTests.map((test, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-sm">Test Name</Label>
                        <Input
                          value={test.test}
                          onChange={(e) => updateLabTest(index, 'test', e.target.value)}
                          placeholder="Test name"
                          list="lab-tests"
                        />
                        <datalist id="lab-tests">
                          {commonLabTests.map(testName => (
                            <option key={testName} value={testName} />
                          ))}
                        </datalist>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">Status</Label>
                        <Select 
                          value={test.status} 
                          onValueChange={(value: any) => updateLabTest(index, 'status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="abnormal">Abnormal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">Result</Label>
                        <Input
                          value={test.result}
                          onChange={(e) => updateLabTest(index, 'result', e.target.value)}
                          placeholder="Test result"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">Normal Range</Label>
                        <div className="flex gap-2">
                          <Input
                            value={test.normalRange}
                            onChange={(e) => updateLabTest(index, 'normalRange', e.target.value)}
                            placeholder="Normal range"
                            className="flex-1"
                          />
                          {labTests.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeLabTest(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRecord}>
                Save Medical Record
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Medical Records List */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No medical records found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search criteria' : 'Create your first medical record'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{record.patientName}</h3>
                        <Badge variant="outline">{record.id}</Badge>
                        {getRecordTypeBadge(record.type)}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm">
                          <strong>Doctor:</strong> {record.doctor} • 
                          <strong> Date:</strong> {new Date(record.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm">
                          <strong>Chief Complaint:</strong> {record.chiefComplaint}
                        </p>
                        <p className="text-sm">
                          <strong>Diagnosis:</strong> {record.diagnosis}
                        </p>
                        {record.followUpDate && (
                          <p className="text-sm text-accent">
                            <strong>Follow-up:</strong> {new Date(record.followUpDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedRecord(record)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Medical Record Details</DialogTitle>
                        <DialogDescription>
                          Complete medical record for {record.patientName}
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedRecord && (
                        <Tabs defaultValue="overview" className="w-full">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="vitals">Vitals & Clinical</TabsTrigger>
                            <TabsTrigger value="medications">Medications</TabsTrigger>
                            <TabsTrigger value="tests">Lab Tests</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="overview" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Patient</Label>
                                <p>{selectedRecord.patientName}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Record ID</Label>
                                <p>{selectedRecord.id}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Doctor</Label>
                                <p>{selectedRecord.doctor}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                                <p>{new Date(selectedRecord.date).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                                <p>{selectedRecord.type}</p>
                              </div>
                              {selectedRecord.followUpDate && (
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Follow-up Date</Label>
                                  <p>{new Date(selectedRecord.followUpDate).toLocaleDateString()}</p>
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Chief Complaint</Label>
                              <p className="mt-1">{selectedRecord.chiefComplaint}</p>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Symptoms & History</Label>
                              <p className="mt-1">{selectedRecord.symptoms || 'Not recorded'}</p>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Diagnosis</Label>
                              <p className="mt-1">{selectedRecord.diagnosis}</p>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Treatment Plan</Label>
                              <p className="mt-1">{selectedRecord.treatment || 'Not specified'}</p>
                            </div>
                            
                            {selectedRecord.notes && (
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Additional Notes</Label>
                                <p className="mt-1">{selectedRecord.notes}</p>
                              </div>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="vitals" className="space-y-4">
                            <div>
                              <Label className="text-base font-medium">Vital Signs</Label>
                              <div className="grid grid-cols-3 gap-4 mt-2">
                                <div>
                                  <Label className="text-sm text-muted-foreground">Temperature</Label>
                                  <p>{selectedRecord.vitals.temperature || 'Not recorded'}</p>
                                </div>
                                <div>
                                  <Label className="text-sm text-muted-foreground">Blood Pressure</Label>
                                  <p>{selectedRecord.vitals.bloodPressure || 'Not recorded'}</p>
                                </div>
                                <div>
                                  <Label className="text-sm text-muted-foreground">Heart Rate</Label>
                                  <p>{selectedRecord.vitals.heartRate || 'Not recorded'}</p>
                                </div>
                                <div>
                                  <Label className="text-sm text-muted-foreground">Weight</Label>
                                  <p>{selectedRecord.vitals.weight || 'Not recorded'}</p>
                                </div>
                                <div>
                                  <Label className="text-sm text-muted-foreground">Height</Label>
                                  <p>{selectedRecord.vitals.height || 'Not recorded'}</p>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="medications" className="space-y-4">
                            {selectedRecord.prescriptions.length === 0 ? (
                              <p className="text-muted-foreground">No medications prescribed</p>
                            ) : (
                              selectedRecord.prescriptions.map((prescription, index) => (
                                <Card key={index} className="p-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm text-muted-foreground">Medication</Label>
                                      <p className="font-medium">{prescription.medication}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm text-muted-foreground">Dosage</Label>
                                      <p>{prescription.dosage}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm text-muted-foreground">Frequency</Label>
                                      <p>{prescription.frequency}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm text-muted-foreground">Duration</Label>
                                      <p>{prescription.duration}</p>
                                    </div>
                                    {prescription.instructions && (
                                      <div className="col-span-2">
                                        <Label className="text-sm text-muted-foreground">Instructions</Label>
                                        <p>{prescription.instructions}</p>
                                      </div>
                                    )}
                                  </div>
                                </Card>
                              ))
                            )}
                          </TabsContent>
                          
                          <TabsContent value="tests" className="space-y-4">
                            {selectedRecord.labTests.length === 0 ? (
                              <p className="text-muted-foreground">No lab tests ordered</p>
                            ) : (
                              selectedRecord.labTests.map((test, index) => (
                                <Card key={index} className="p-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm text-muted-foreground">Test</Label>
                                      <p className="font-medium">{test.test}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm text-muted-foreground">Status</Label>
                                      <Badge 
                                        variant={test.status === 'normal' ? 'default' : 
                                                test.status === 'abnormal' ? 'destructive' : 'outline'}
                                        className={test.status === 'normal' ? 'bg-green-500' : ''}
                                      >
                                        {test.status}
                                      </Badge>
                                    </div>
                                    <div>
                                      <Label className="text-sm text-muted-foreground">Result</Label>
                                      <p>{test.result || 'Pending'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm text-muted-foreground">Normal Range</Label>
                                      <p>{test.normalRange || 'Not specified'}</p>
                                    </div>
                                  </div>
                                </Card>
                              ))
                            )}
                          </TabsContent>
                        </Tabs>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}