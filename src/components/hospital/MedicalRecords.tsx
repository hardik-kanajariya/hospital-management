import { useState } from 'react'
import { useKV } from '@/hooks/useLocalStorage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  StethoscopeIcon,
  PillIcon,
  PulseIcon,
  EyeIcon,
  HeartIcon,
  TestTubeIcon,
  CalendarIcon,
  UserIcon,
  ThermometerIcon
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Patient, Doctor } from '@/types/hospital'

interface MedicalRecord {
  id: string
  patientId: string
  patientName: string
  doctor: string
  date: string
  type: 'consultation' | 'follow-up' | 'emergency' | 'surgery' | 'admission' | 'discharge'
  chiefComplaint: string
  symptoms: string
  vitals: {
    temperature: string
    bloodPressure: string
    heartRate: string
    respiratoryRate: string
    weight: string
    height: string
    oxygenSaturation: string
  }
  diagnosis: string
  treatment: string
  prescriptions: Array<{
    id: string
    medication: string
    dosage: string
    frequency: string
    duration: string
    instructions: string
    route: string
  }>
  labTests: Array<{
    id: string
    test: string
    orderDate: string
    result?: string
    normalRange?: string
    status: 'ordered' | 'pending' | 'completed'
    urgency: 'routine' | 'urgent' | 'stat'
  }>
  followUpDate?: string
  notes: string
  attachments?: Array<{
    id: string
    name: string
    type: string
    uploadDate: string
  }>
  createdAt: string
  updatedAt: string
}

interface Prescription {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  date: string
  medications: Array<{
    name: string
    dosage: string
    frequency: string
    duration: string
    instructions: string
    route: string
  }>
  diagnosis: string
  status: 'active' | 'completed' | 'cancelled'
  pharmacyNotes?: string
  createdAt: string
}

const medicationRoutes = ['Oral', 'Injection', 'Topical', 'Inhalation', 'IV', 'IM', 'Sublingual']
const medicationFrequencies = ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours', 'As needed', 'Before meals', 'After meals']
const commonMedications = [
  'Paracetamol', 'Ibuprofen', 'Amoxicillin', 'Azithromycin', 'Metformin', 'Amlodipine',
  'Atorvastatin', 'Pantoprazole', 'Cetirizine', 'Salbutamol', 'Insulin', 'Aspirin'
]

const commonTests = [
  'Complete Blood Count (CBC)', 'Blood Sugar (Fasting)', 'Blood Sugar (Random)', 'HbA1c',
  'Lipid Profile', 'Liver Function Test', 'Kidney Function Test', 'Thyroid Function Test',
  'Urine Routine', 'ECG', 'Chest X-Ray', 'Echocardiogram', 'Ultrasound Abdomen'
]

export default function MedicalRecords() {
  const [records, setRecords] = useKV<MedicalRecord[]>('medical-records', [])
  const [prescriptions, setPrescriptions] = useKV<Prescription[]>('prescriptions', [])
  const [patients] = useKV<Patient[]>('hospital-patients', [])
  const [doctors] = useKV<Doctor[]>('hospital-doctors', [])

  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false)
  const [isPrescriptionDialogOpen, setIsPrescriptionDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const [recordFormData, setRecordFormData] = useState<Partial<MedicalRecord>>({
    type: 'consultation',
    date: new Date().toISOString().split('T')[0],
    vitals: {
      temperature: '',
      bloodPressure: '',
      heartRate: '',
      respiratoryRate: '',
      weight: '',
      height: '',
      oxygenSaturation: ''
    },
    prescriptions: [],
    labTests: []
  })

  const [prescriptionFormData, setPrescriptionFormData] = useState<Partial<Prescription>>({
    date: new Date().toISOString().split('T')[0],
    status: 'active',
    medications: [{
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      route: 'Oral'
    }]
  })

  const handleAddRecord = () => {
    if (!recordFormData.patientId || !recordFormData.doctor || !recordFormData.chiefComplaint) {
      toast.error('Please fill in all required fields')
      return
    }

    const patient = patients.find(p => p.id === recordFormData.patientId)
    if (!patient) {
      toast.error('Patient not found')
      return
    }

    const newRecord: MedicalRecord = {
      id: `MR${Date.now()}`,
      patientId: recordFormData.patientId!,
      patientName: `${patient?.firstName || ''} ${patient?.lastName || ''}`.trim(),
      doctor: recordFormData.doctor!,
      date: recordFormData.date!,
      type: recordFormData.type as any,
      chiefComplaint: recordFormData.chiefComplaint!,
      symptoms: recordFormData.symptoms || '',
      vitals: recordFormData.vitals!,
      diagnosis: recordFormData.diagnosis || '',
      treatment: recordFormData.treatment || '',
      prescriptions: recordFormData.prescriptions || [],
      labTests: recordFormData.labTests || [],
      followUpDate: recordFormData.followUpDate,
      notes: recordFormData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setRecords(current => [...current, newRecord])
    setRecordFormData({
      type: 'consultation',
      date: new Date().toISOString().split('T')[0],
      vitals: {
        temperature: '',
        bloodPressure: '',
        heartRate: '',
        respiratoryRate: '',
        weight: '',
        height: '',
        oxygenSaturation: ''
      },
      prescriptions: [],
      labTests: []
    })
    setIsRecordDialogOpen(false)
    toast.success('Medical record created successfully')
  }

  const handleAddPrescription = () => {
    if (!prescriptionFormData.patientId || !prescriptionFormData.doctorId || !prescriptionFormData.medications?.length) {
      toast.error('Please fill in all required fields')
      return
    }

    const patient = patients?.find(p => p.id === prescriptionFormData.patientId)
    const doctor = doctors?.find(d => d.id === prescriptionFormData.doctorId)

    if (!patient || !doctor) {
      toast.error('Patient or doctor not found')
      return
    }

    const newPrescription: Prescription = {
      id: `RX${Date.now()}`,
      patientId: prescriptionFormData.patientId!,
      patientName: `${patient?.firstName || ''} ${patient?.lastName || ''}`.trim(),
      doctorId: prescriptionFormData.doctorId!,
      doctorName: doctor?.name || '',
      date: prescriptionFormData.date!,
      medications: prescriptionFormData.medications!.filter(med => med.name),
      diagnosis: prescriptionFormData.diagnosis || '',
      status: prescriptionFormData.status as any,
      pharmacyNotes: prescriptionFormData.pharmacyNotes,
      createdAt: new Date().toISOString()
    }

    setPrescriptions(current => [...current, newPrescription])
    setPrescriptionFormData({
      date: new Date().toISOString().split('T')[0],
      status: 'active',
      medications: [{
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        route: 'Oral'
      }]
    })
    setIsPrescriptionDialogOpen(false)
    toast.success('Prescription created successfully')
  }

  const addMedication = () => {
    setPrescriptionFormData(prev => ({
      ...prev,
      medications: [
        ...(prev.medications || []),
        {
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
          route: 'Oral'
        }
      ]
    }))
  }

  const updateMedication = (index: number, field: string, value: string) => {
    setPrescriptionFormData(prev => ({
      ...prev,
      medications: prev.medications?.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      )
    }))
  }

  const removeMedication = (index: number) => {
    setPrescriptionFormData(prev => ({
      ...prev,
      medications: prev.medications?.filter((_, i) => i !== index)
    }))
  }

  const addLabTest = () => {
    setRecordFormData(prev => ({
      ...prev,
      labTests: [
        ...(prev.labTests || []),
        {
          id: `LT${Date.now()}`,
          test: '',
          orderDate: new Date().toISOString().split('T')[0],
          status: 'ordered',
          urgency: 'routine'
        }
      ]
    }))
  }

  const updateLabTest = (index: number, field: string, value: string) => {
    setRecordFormData(prev => ({
      ...prev,
      labTests: prev.labTests?.map((test, i) =>
        i === index ? { ...test, [field]: value } : test
      )
    }))
  }

  const removeLabTest = (index: number) => {
    setRecordFormData(prev => ({
      ...prev,
      labTests: prev.labTests?.filter((_, i) => i !== index)
    }))
  }

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'all' || record.type === filterType

    return matchesSearch && matchesType
  })

  const recentRecords = records
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const todayRecords = records.filter(r => r.date === new Date().toISOString().split('T')[0])
  const activeRecords = records.filter(r => r.followUpDate && r.followUpDate >= new Date().toISOString().split('T')[0])

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search medical records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="follow-up">Follow-up</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="surgery">Surgery</SelectItem>
              <SelectItem value="admission">Admission</SelectItem>
              <SelectItem value="discharge">Discharge</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Dialog open={isPrescriptionDialogOpen} onOpenChange={setIsPrescriptionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <PillIcon className="h-4 w-4" />
                New Prescription
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Prescription</DialogTitle>
                <DialogDescription>Generate a prescription for patient medication</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Patient *</Label>
                    <Select value={prescriptionFormData.patientId} onValueChange={(value) => {
                      const patient = patients.find(p => p.id === value)
                      setPrescriptionFormData({ ...prescriptionFormData, patientId: value, patientName: `${patient?.firstName || ''} ${patient?.lastName || ''}`.trim() })
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {`${patient.firstName || ''} ${patient.lastName || ''}`.trim()} - {patient.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Doctor *</Label>
                    <Select value={prescriptionFormData.doctorId} onValueChange={(value) => setPrescriptionFormData({ ...prescriptionFormData, doctorId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.filter(d => d.isActive).map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            Dr. {doctor.name} - {doctor.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={prescriptionFormData.date}
                      onChange={(e) => setPrescriptionFormData({ ...prescriptionFormData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Diagnosis</Label>
                    <Input
                      value={prescriptionFormData.diagnosis}
                      onChange={(e) => setPrescriptionFormData({ ...prescriptionFormData, diagnosis: e.target.value })}
                      placeholder="Primary diagnosis"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Medications</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addMedication}>
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Medication
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {prescriptionFormData.medications?.map((medication, index) => (
                      <Card key={index} className="p-4">
                        <div className="grid gap-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Medication *</Label>
                              <Select
                                value={medication.name}
                                onValueChange={(value) => updateMedication(index, 'name', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select medication" />
                                </SelectTrigger>
                                <SelectContent>
                                  {commonMedications.map((med) => (
                                    <SelectItem key={med} value={med}>{med}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Dosage</Label>
                              <Input
                                value={medication.dosage}
                                onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                placeholder="e.g., 500mg, 1 tablet"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Frequency</Label>
                              <Select
                                value={medication.frequency}
                                onValueChange={(value) => updateMedication(index, 'frequency', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                  {medicationFrequencies.map((freq) => (
                                    <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Duration</Label>
                              <Input
                                value={medication.duration}
                                onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                placeholder="e.g., 7 days, 2 weeks"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Route</Label>
                              <Select
                                value={medication.route}
                                onValueChange={(value) => updateMedication(index, 'route', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Route" />
                                </SelectTrigger>
                                <SelectContent>
                                  {medicationRoutes.map((route) => (
                                    <SelectItem key={route} value={route}>{route}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Instructions</Label>
                            <Input
                              value={medication.instructions}
                              onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                              placeholder="Special instructions for taking the medication"
                            />
                          </div>

                          {prescriptionFormData.medications!.length > 1 && (
                            <div className="flex justify-end">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeMedication(index)}
                              >
                                Remove
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Pharmacy Notes</Label>
                  <Textarea
                    value={prescriptionFormData.pharmacyNotes}
                    onChange={(e) => setPrescriptionFormData({ ...prescriptionFormData, pharmacyNotes: e.target.value })}
                    placeholder="Additional notes for pharmacy"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsPrescriptionDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddPrescription}>Create Prescription</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                New Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Medical Record</DialogTitle>
                <DialogDescription>Document patient consultation and treatment details</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Patient *</Label>
                    <Select value={recordFormData.patientId} onValueChange={(value) => {
                      const patient = patients.find(p => p.id === value)
                      setRecordFormData({ ...recordFormData, patientId: value, patientName: `${patient?.firstName || ''} ${patient?.lastName || ''}`.trim() })
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {`${patient.firstName || ''} ${patient.lastName || ''}`.trim()} - {patient.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Doctor *</Label>
                    <Select value={recordFormData.doctor} onValueChange={(value) => setRecordFormData({ ...recordFormData, doctor: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.filter(d => d.isActive).map((doctor) => (
                          <SelectItem key={doctor.id} value={`Dr. ${doctor.name}`}>
                            Dr. {doctor.name} - {doctor.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={recordFormData.date}
                      onChange={(e) => setRecordFormData({ ...recordFormData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Record Type</Label>
                    <Select value={recordFormData.type} onValueChange={(value) => setRecordFormData({ ...recordFormData, type: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="surgery">Surgery</SelectItem>
                        <SelectItem value="admission">Admission</SelectItem>
                        <SelectItem value="discharge">Discharge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Follow-up Date</Label>
                    <Input
                      type="date"
                      value={recordFormData.followUpDate}
                      onChange={(e) => setRecordFormData({ ...recordFormData, followUpDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Clinical Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Chief Complaint *</Label>
                    <Input
                      value={recordFormData.chiefComplaint}
                      onChange={(e) => setRecordFormData({ ...recordFormData, chiefComplaint: e.target.value })}
                      placeholder="Primary reason for visit"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Symptoms</Label>
                    <Textarea
                      value={recordFormData.symptoms}
                      onChange={(e) => setRecordFormData({ ...recordFormData, symptoms: e.target.value })}
                      placeholder="Patient's symptoms and history"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Vital Signs */}
                <Card className="p-4">
                  <Label className="text-base font-medium mb-4 block">Vital Signs</Label>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Temperature (°F)</Label>
                      <Input
                        value={recordFormData.vitals?.temperature}
                        onChange={(e) => setRecordFormData({
                          ...recordFormData,
                          vitals: { ...recordFormData.vitals!, temperature: e.target.value }
                        })}
                        placeholder="98.6"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Blood Pressure</Label>
                      <Input
                        value={recordFormData.vitals?.bloodPressure}
                        onChange={(e) => setRecordFormData({
                          ...recordFormData,
                          vitals: { ...recordFormData.vitals!, bloodPressure: e.target.value }
                        })}
                        placeholder="120/80"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Heart Rate (bpm)</Label>
                      <Input
                        value={recordFormData.vitals?.heartRate}
                        onChange={(e) => setRecordFormData({
                          ...recordFormData,
                          vitals: { ...recordFormData.vitals!, heartRate: e.target.value }
                        })}
                        placeholder="72"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Respiratory Rate</Label>
                      <Input
                        value={recordFormData.vitals?.respiratoryRate}
                        onChange={(e) => setRecordFormData({
                          ...recordFormData,
                          vitals: { ...recordFormData.vitals!, respiratoryRate: e.target.value }
                        })}
                        placeholder="16"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Weight (kg)</Label>
                      <Input
                        value={recordFormData.vitals?.weight}
                        onChange={(e) => setRecordFormData({
                          ...recordFormData,
                          vitals: { ...recordFormData.vitals!, weight: e.target.value }
                        })}
                        placeholder="70"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Height (cm)</Label>
                      <Input
                        value={recordFormData.vitals?.height}
                        onChange={(e) => setRecordFormData({
                          ...recordFormData,
                          vitals: { ...recordFormData.vitals!, height: e.target.value }
                        })}
                        placeholder="170"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Oxygen Saturation (%)</Label>
                      <Input
                        value={recordFormData.vitals?.oxygenSaturation}
                        onChange={(e) => setRecordFormData({
                          ...recordFormData,
                          vitals: { ...recordFormData.vitals!, oxygenSaturation: e.target.value }
                        })}
                        placeholder="98"
                      />
                    </div>
                  </div>
                </Card>

                {/* Diagnosis and Treatment */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Diagnosis</Label>
                    <Textarea
                      value={recordFormData.diagnosis}
                      onChange={(e) => setRecordFormData({ ...recordFormData, diagnosis: e.target.value })}
                      placeholder="Primary and secondary diagnoses"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Treatment Plan</Label>
                    <Textarea
                      value={recordFormData.treatment}
                      onChange={(e) => setRecordFormData({ ...recordFormData, treatment: e.target.value })}
                      placeholder="Treatment recommendations and procedures"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Lab Tests */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-base font-medium">Lab Tests Ordered</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addLabTest}>
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Test
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {recordFormData.labTests?.map((test, index) => (
                      <div key={index} className="grid grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                          <Label>Test</Label>
                          <Select
                            value={test.test}
                            onValueChange={(value) => updateLabTest(index, 'test', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select test" />
                            </SelectTrigger>
                            <SelectContent>
                              {commonTests.map((test) => (
                                <SelectItem key={test} value={test}>{test}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Order Date</Label>
                          <Input
                            type="date"
                            value={test.orderDate}
                            onChange={(e) => updateLabTest(index, 'orderDate', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Urgency</Label>
                          <Select
                            value={test.urgency}
                            onValueChange={(value) => updateLabTest(index, 'urgency', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="routine">Routine</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                              <SelectItem value="stat">STAT</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          {recordFormData.labTests!.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeLabTest(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={recordFormData.notes}
                    onChange={(e) => setRecordFormData({ ...recordFormData, notes: e.target.value })}
                    placeholder="Additional clinical notes and observations"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsRecordDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddRecord}>Create Record</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Records</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayRecords.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Follow-ups Due</CardTitle>
            <PulseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRecords.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
            <PillIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prescriptions.filter(p => p.status === 'active').length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="records" className="space-y-4">
        <TabsList>
          <TabsTrigger value="records">Medical Records</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medical Records</CardTitle>
              <CardDescription>
                {filteredRecords.length} of {records.length} records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <FileTextIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No medical records found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? 'Try adjusting your search terms' : 'Start by creating your first medical record'}
                    </p>
                  </div>
                ) : (
                  filteredRecords.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{record.id}</Badge>
                          <Badge variant={
                            record.type === 'emergency' ? 'destructive' :
                              record.type === 'surgery' ? 'secondary' : 'default'
                          }>
                            {record.type}
                          </Badge>
                          {record.followUpDate && record.followUpDate >= new Date().toISOString().split('T')[0] && (
                            <Badge variant="outline" className="text-blue-600">Follow-up Due</Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRecord(record)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <EyeIcon className="h-4 w-4" />
                            View
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            <span className="font-medium">{record.patientName}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Doctor: {record.doctor}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Date: {new Date(record.date).toLocaleDateString()}
                          </div>
                          <div className="text-sm">
                            <strong>Chief Complaint:</strong> {record.chiefComplaint}
                          </div>
                        </div>

                        <div className="space-y-2">
                          {record.diagnosis && (
                            <div className="text-sm">
                              <strong>Diagnosis:</strong> {record.diagnosis}
                            </div>
                          )}
                          {record.vitals.temperature && (
                            <div className="flex items-center gap-2 text-sm">
                              <ThermometerIcon className="h-3 w-3" />
                              <span>Temp: {record.vitals.temperature}°F</span>
                              {record.vitals.bloodPressure && (
                                <>
                                  <HeartIcon className="h-3 w-3 ml-2" />
                                  <span>BP: {record.vitals.bloodPressure}</span>
                                </>
                              )}
                            </div>
                          )}
                          {record.followUpDate && (
                            <div className="text-sm text-muted-foreground">
                              Follow-up: {new Date(record.followUpDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      {record.prescriptions.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-sm font-medium mb-2">Prescriptions:</div>
                          <div className="flex flex-wrap gap-1">
                            {record.prescriptions.map((prescription, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {prescription.medication}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {record.labTests.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-sm font-medium mb-2">Lab Tests:</div>
                          <div className="flex flex-wrap gap-1">
                            {record.labTests.map((test, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {test.test} - {test.status}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions</CardTitle>
              <CardDescription>All patient prescriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescriptions.length === 0 ? (
                  <div className="text-center py-8">
                    <PillIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No prescriptions found</h3>
                    <p className="text-muted-foreground">Start by creating your first prescription</p>
                  </div>
                ) : (
                  prescriptions.map((prescription) => (
                    <div key={prescription.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{prescription.id}</Badge>
                          <Badge variant={
                            prescription.status === 'active' ? 'default' :
                              prescription.status === 'completed' ? 'secondary' : 'destructive'
                          }>
                            {prescription.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(prescription.date).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          <span className="font-medium">{prescription.patientName}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Prescribed by: {prescription.doctorName}
                        </div>
                        {prescription.diagnosis && (
                          <div className="text-sm">
                            <strong>Diagnosis:</strong> {prescription.diagnosis}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm font-medium mb-2">Medications:</div>
                        <div className="space-y-2">
                          {prescription.medications.map((medication, index) => (
                            <div key={index} className="bg-muted/30 rounded p-2 text-sm">
                              <div className="font-medium">{medication.name}</div>
                              <div className="text-muted-foreground">
                                {medication.dosage} • {medication.frequency} • {medication.duration} • {medication.route}
                              </div>
                              {medication.instructions && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {medication.instructions}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {prescription.pharmacyNotes && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-sm">
                            <strong>Pharmacy Notes:</strong> {prescription.pharmacyNotes}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Record Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Medical Record Details</DialogTitle>
            <DialogDescription>
              {selectedRecord && `Record ${selectedRecord.id} for ${selectedRecord.patientName}`}
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Patient</Label>
                  <p>{selectedRecord.patientName}</p>
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
                  <p className="capitalize">{selectedRecord.type}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Chief Complaint</Label>
                <p>{selectedRecord.chiefComplaint}</p>
              </div>

              {selectedRecord.symptoms && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Symptoms</Label>
                  <p>{selectedRecord.symptoms}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">Vital Signs</Label>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>Temperature: {selectedRecord.vitals.temperature}°F</div>
                  <div>BP: {selectedRecord.vitals.bloodPressure}</div>
                  <div>HR: {selectedRecord.vitals.heartRate} bpm</div>
                  <div>RR: {selectedRecord.vitals.respiratoryRate}</div>
                  <div>Weight: {selectedRecord.vitals.weight} kg</div>
                  <div>Height: {selectedRecord.vitals.height} cm</div>
                  <div>SpO2: {selectedRecord.vitals.oxygenSaturation}%</div>
                </div>
              </div>

              {selectedRecord.diagnosis && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Diagnosis</Label>
                  <p>{selectedRecord.diagnosis}</p>
                </div>
              )}

              {selectedRecord.treatment && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Treatment</Label>
                  <p>{selectedRecord.treatment}</p>
                </div>
              )}

              {selectedRecord.prescriptions.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">Prescriptions</Label>
                  <div className="space-y-2">
                    {selectedRecord.prescriptions.map((prescription, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="font-medium">{prescription.medication}</div>
                        <div className="text-sm text-muted-foreground">
                          {prescription.dosage} • {prescription.frequency} • {prescription.duration}
                        </div>
                        {prescription.instructions && (
                          <div className="text-sm">{prescription.instructions}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRecord.labTests.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">Lab Tests</Label>
                  <div className="space-y-2">
                    {selectedRecord.labTests.map((test, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{test.test}</div>
                          <Badge variant={
                            test.status === 'completed' ? 'default' :
                              test.status === 'pending' ? 'secondary' : 'outline'
                          }>
                            {test.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Ordered: {new Date(test.orderDate).toLocaleDateString()} • {test.urgency}
                        </div>
                        {test.result && (
                          <div className="text-sm mt-1">
                            Result: {test.result} ({test.normalRange})
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRecord.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                  <p>{selectedRecord.notes}</p>
                </div>
              )}

              {selectedRecord.followUpDate && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Follow-up Date</Label>
                  <p>{new Date(selectedRecord.followUpDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}