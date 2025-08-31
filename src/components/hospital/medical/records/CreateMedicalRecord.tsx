import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    ArrowLeftIcon,
    FloppyDiskIcon,
    PlusIcon,
    TrashIcon,
    UserIcon,
    StethoscopeIcon,
    CalendarIcon,
    PillIcon,
    TestTubeIcon,
    HeartIcon
} from '@phosphor-icons/react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { usePatientApi } from '@/hooks/usePatientApi'
import { useDoctorApi } from '@/hooks/useDoctorApi'
import { useMedicalRecordApi } from '@/hooks/useMedicalRecordApi'

interface MedicalRecordFormData {
    patient_id: string
    doctor_id: string
    appointment_id?: string
    visit_date: string
    diagnosis: string
    treatment: string
    medications: Array<{
        name: string
        dosage: string
        frequency: string
        duration: string
        instructions: string
    }>
    lab_results: Array<{
        test_name: string
        result: string
        normal_range: string
        status: string
    }>
    follow_up_instructions: string[]
    next_visit_date?: string
    vital_signs: {
        temperature: string
        blood_pressure: string
        heart_rate: string
        respiratory_rate: string
        oxygen_saturation: string
        weight: string
        height: string
    }
    notes?: string
    attachments: Array<{
        name: string
        url: string
        type: string
    }>
}

export default function CreateMedicalRecord() {
    const navigate = useNavigate()
    const { patientId } = useParams<{ patientId?: string }>()
    const [searchParams] = useSearchParams()
    const preSelectedPatientId = patientId || searchParams.get('patientId')

    const [formData, setFormData] = useState<MedicalRecordFormData>({
        patient_id: preSelectedPatientId || '',
        doctor_id: '',
        visit_date: new Date().toISOString().split('T')[0],
        diagnosis: '',
        treatment: '',
        medications: [],
        lab_results: [],
        follow_up_instructions: [],
        vital_signs: {
            temperature: '',
            blood_pressure: '',
            heart_rate: '',
            respiratory_rate: '',
            oxygen_saturation: '',
            weight: '',
            height: ''
        },
        notes: '',
        attachments: []
    })

    const [activeTab, setActiveTab] = useState('basic')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { patients } = usePatientApi()
    const { createMedicalRecord } = useMedicalRecordApi()
    const { doctorUsers, loadingDoctorUsers } = useDoctorApi()

    // Use real doctor users instead of mock data
    const doctors = doctorUsers

    const selectedPatient = patients.find(p => p.id === formData.patient_id)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Validation
            if (!formData.patient_id) {
                toast.error('Please select a patient')
                setActiveTab('basic')
                return
            }

            // Check if doctors are available
            if (doctors.length === 0) {
                toast.error('No doctors available. Please ensure users with doctor role exist in the system.')
                setActiveTab('basic')
                return
            }

            if (!formData.doctor_id) {
                toast.error('Please select a doctor')
                setActiveTab('basic')
                return
            }
            if (!formData.diagnosis.trim()) {
                toast.error('Diagnosis is required')
                setActiveTab('basic')
                return
            }
            if (!formData.treatment.trim()) {
                toast.error('Treatment is required')
                setActiveTab('basic')
                return
            }

            // Clean up data
            const cleanedMedications = formData.medications.filter(med => med.name.trim())
            const cleanedLabResults = formData.lab_results.filter(lab => lab.test_name.trim())
            const cleanedFollowUpInstructions = formData.follow_up_instructions.filter(instruction => instruction.trim())

            const recordData = {
                patientId: formData.patient_id,
                doctorId: formData.doctor_id,
                appointmentId: formData.appointment_id,
                visitDate: formData.visit_date,
                diagnosis: formData.diagnosis,
                treatment: formData.treatment,
                medications: cleanedMedications,
                labResults: cleanedLabResults,
                followUpInstructions: cleanedFollowUpInstructions,
                nextVisitDate: formData.next_visit_date,
                vitalSigns: formData.vital_signs,
                notes: formData.notes,
                attachments: formData.attachments
            }

            // Create medical record via API
            console.log('🚀 About to create medical record with data:', recordData)
            console.log('🔗 API endpoint:', 'POST /medical-records')

            const newRecord = await createMedicalRecord(recordData)
            console.log('✅ Medical record created successfully:', newRecord)

            if (newRecord) {
                toast.success('Medical record created successfully!')

                // Navigate back to appropriate page
                if (preSelectedPatientId) {
                    navigate(`/patients/${preSelectedPatientId}/medical-records`)
                } else {
                    navigate('/medical-records')
                }
            } else {
                throw new Error('Failed to create medical record')
            }
        } catch (error) {
            console.error('❌ Error creating medical record:', error)
            console.error('📊 Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                formData: formData
            })
            toast.error('Failed to create medical record')
        } finally {
            setIsSubmitting(false)
        }
    }

    const addMedication = () => {
        setFormData(prev => ({
            ...prev,
            medications: [...prev.medications, {
                name: '',
                dosage: '',
                frequency: '',
                duration: '',
                instructions: ''
            }]
        }))
    }

    const updateMedication = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            medications: prev.medications.map((med, i) =>
                i === index ? { ...med, [field]: value } : med
            )
        }))
    }

    const removeMedication = (index: number) => {
        setFormData(prev => ({
            ...prev,
            medications: prev.medications.filter((_, i) => i !== index)
        }))
    }

    const addLabResult = () => {
        setFormData(prev => ({
            ...prev,
            lab_results: [...prev.lab_results, {
                test_name: '',
                result: '',
                normal_range: '',
                status: 'completed'
            }]
        }))
    }

    const updateLabResult = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            lab_results: prev.lab_results.map((lab, i) =>
                i === index ? { ...lab, [field]: value } : lab
            )
        }))
    }

    const removeLabResult = (index: number) => {
        setFormData(prev => ({
            ...prev,
            lab_results: prev.lab_results.filter((_, i) => i !== index)
        }))
    }

    const addFollowUpInstruction = () => {
        setFormData(prev => ({
            ...prev,
            follow_up_instructions: [...prev.follow_up_instructions, '']
        }))
    }

    const updateFollowUpInstruction = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            follow_up_instructions: prev.follow_up_instructions.map((instruction, i) =>
                i === index ? value : instruction
            )
        }))
    }

    const removeFollowUpInstruction = (index: number) => {
        setFormData(prev => ({
            ...prev,
            follow_up_instructions: prev.follow_up_instructions.filter((_, i) => i !== index)
        }))
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <div className="flex items-center gap-2">
                    <PlusIcon className="w-6 h-6 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">Create Medical Record</h1>
                        <p className="text-muted-foreground">
                            {selectedPatient ? `For ${selectedPatient.name} (${selectedPatient.patient_id})` : 'Add new patient medical record'}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Medical Record Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                <TabsTrigger value="medications">Medications</TabsTrigger>
                                <TabsTrigger value="lab">Lab Results</TabsTrigger>
                                <TabsTrigger value="follow-up">Follow-up</TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic" className="space-y-6 mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="patient">Patient *</Label>
                                            <Select
                                                value={formData.patient_id}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, patient_id: value }))}
                                                disabled={!!preSelectedPatientId}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select patient" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {patients.filter(patient => patient.id && patient.id.trim() !== '').map(patient => (
                                                        <SelectItem key={patient.id} value={patient.id}>
                                                            <div className="flex items-center gap-2">
                                                                <UserIcon className="w-4 h-4" />
                                                                {patient.name} ({patient.patient_id})
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {preSelectedPatientId && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Patient pre-selected from patient profile
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="doctor">Doctor *</Label>
                                            <Select
                                                value={formData.doctor_id}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, doctor_id: value }))}
                                                disabled={loadingDoctorUsers}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue
                                                        placeholder={
                                                            loadingDoctorUsers
                                                                ? "Loading doctors..."
                                                                : doctors.length === 0
                                                                    ? "No doctors available"
                                                                    : "Select doctor"
                                                        }
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingDoctorUsers ? (
                                                        <SelectItem value="0" disabled>
                                                            <div className="flex items-center gap-2">
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300"></div>
                                                                Loading doctors...
                                                            </div>
                                                        </SelectItem>
                                                    ) : doctors.length === 0 ? (
                                                        <SelectItem value="0" disabled>
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <StethoscopeIcon className="w-4 h-4" />
                                                                No doctors with doctor role found
                                                            </div>
                                                        </SelectItem>
                                                    ) : (
                                                        doctors
                                                            .filter(doctor => doctor.id && doctor.id.trim() !== '' && doctor.isActive)
                                                            .map(doctor => (
                                                                <SelectItem key={doctor.id} value={doctor.id}>
                                                                    <div className="flex items-center gap-2">
                                                                        <StethoscopeIcon className="w-4 h-4" />
                                                                        {doctor.name} - {doctor.specialization}
                                                                        {doctor.department && (
                                                                            <span className="text-xs text-muted-foreground">
                                                                                ({doctor.department})
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </SelectItem>
                                                            ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {loadingDoctorUsers && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Fetching users with doctor role...
                                                </p>
                                            )}
                                            {!loadingDoctorUsers && doctors.length === 0 && (
                                                <p className="text-xs text-amber-600 mt-1">
                                                    No active users with doctor role found. Please ensure users are assigned the doctor role.
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="visit_date">Visit Date *</Label>
                                            <Input
                                                id="visit_date"
                                                type="date"
                                                value={formData.visit_date}
                                                onChange={(e) => setFormData(prev => ({ ...prev, visit_date: e.target.value }))}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="diagnosis">Diagnosis *</Label>
                                            <Textarea
                                                id="diagnosis"
                                                value={formData.diagnosis}
                                                onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                                                placeholder="Enter patient diagnosis"
                                                rows={3}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="treatment">Treatment *</Label>
                                            <Textarea
                                                id="treatment"
                                                value={formData.treatment}
                                                onChange={(e) => setFormData(prev => ({ ...prev, treatment: e.target.value }))}
                                                placeholder="Enter treatment plan"
                                                rows={3}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <HeartIcon className="w-5 h-5 text-red-500" />
                                            Vital Signs
                                        </h3>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Temperature (°F)</Label>
                                                <Input
                                                    value={formData.vital_signs.temperature}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        vital_signs: { ...prev.vital_signs, temperature: e.target.value }
                                                    }))}
                                                    placeholder="98.6"
                                                />
                                            </div>
                                            <div>
                                                <Label>Blood Pressure</Label>
                                                <Input
                                                    value={formData.vital_signs.blood_pressure}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        vital_signs: { ...prev.vital_signs, blood_pressure: e.target.value }
                                                    }))}
                                                    placeholder="120/80"
                                                />
                                            </div>
                                            <div>
                                                <Label>Heart Rate (bpm)</Label>
                                                <Input
                                                    value={formData.vital_signs.heart_rate}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        vital_signs: { ...prev.vital_signs, heart_rate: e.target.value }
                                                    }))}
                                                    placeholder="72"
                                                />
                                            </div>
                                            <div>
                                                <Label>Respiratory Rate</Label>
                                                <Input
                                                    value={formData.vital_signs.respiratory_rate}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        vital_signs: { ...prev.vital_signs, respiratory_rate: e.target.value }
                                                    }))}
                                                    placeholder="16"
                                                />
                                            </div>
                                            <div>
                                                <Label>O2 Saturation (%)</Label>
                                                <Input
                                                    value={formData.vital_signs.oxygen_saturation}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        vital_signs: { ...prev.vital_signs, oxygen_saturation: e.target.value }
                                                    }))}
                                                    placeholder="98"
                                                />
                                            </div>
                                            <div>
                                                <Label>Weight (kg)</Label>
                                                <Input
                                                    value={formData.vital_signs.weight}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        vital_signs: { ...prev.vital_signs, weight: e.target.value }
                                                    }))}
                                                    placeholder="70"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="notes">Additional Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={formData.notes}
                                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                                placeholder="Any additional observations or notes"
                                                rows={4}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="medications" className="space-y-6 mt-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <PillIcon className="w-5 h-5 text-blue-500" />
                                        Medications
                                    </h3>
                                    <Button type="button" variant="outline" onClick={addMedication}>
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Add Medication
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {formData.medications.map((medication, index) => (
                                        <Card key={index} className="p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Medication Name</Label>
                                                    <Input
                                                        value={medication.name}
                                                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                                        placeholder="e.g., Lisinopril"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Dosage</Label>
                                                    <Input
                                                        value={medication.dosage}
                                                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                                        placeholder="e.g., 10mg"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Frequency</Label>
                                                    <Input
                                                        value={medication.frequency}
                                                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                                        placeholder="e.g., Once daily"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Duration</Label>
                                                    <Input
                                                        value={medication.duration}
                                                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                                        placeholder="e.g., 30 days"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label>Instructions</Label>
                                                    <Textarea
                                                        value={medication.instructions}
                                                        onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                                                        placeholder="Special instructions for taking this medication"
                                                        rows={2}
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="mt-4"
                                                onClick={() => removeMedication(index)}
                                            >
                                                <TrashIcon className="w-3 h-3 mr-1" />
                                                Remove
                                            </Button>
                                        </Card>
                                    ))}

                                    {formData.medications.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <PillIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>No medications added</p>
                                            <p className="text-sm">Click "Add Medication" to prescribe medications</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="lab" className="space-y-6 mt-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <TestTubeIcon className="w-5 h-5 text-purple-500" />
                                        Lab Results
                                    </h3>
                                    <Button type="button" variant="outline" onClick={addLabResult}>
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Add Lab Result
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {formData.lab_results.map((labResult, index) => (
                                        <Card key={index} className="p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Test Name</Label>
                                                    <Input
                                                        value={labResult.test_name}
                                                        onChange={(e) => updateLabResult(index, 'test_name', e.target.value)}
                                                        placeholder="e.g., Blood Glucose"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Result</Label>
                                                    <Input
                                                        value={labResult.result}
                                                        onChange={(e) => updateLabResult(index, 'result', e.target.value)}
                                                        placeholder="e.g., 95 mg/dL"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Normal Range</Label>
                                                    <Input
                                                        value={labResult.normal_range}
                                                        onChange={(e) => updateLabResult(index, 'normal_range', e.target.value)}
                                                        placeholder="e.g., 70-100 mg/dL"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Status</Label>
                                                    <Select
                                                        value={labResult.status}
                                                        onValueChange={(value) => updateLabResult(index, 'status', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="completed">Completed</SelectItem>
                                                            <SelectItem value="pending">Pending</SelectItem>
                                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="mt-4"
                                                onClick={() => removeLabResult(index)}
                                            >
                                                <TrashIcon className="w-3 h-3 mr-1" />
                                                Remove
                                            </Button>
                                        </Card>
                                    ))}

                                    {formData.lab_results.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <TestTubeIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>No lab results added</p>
                                            <p className="text-sm">Click "Add Lab Result" to record test results</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="follow-up" className="space-y-6 mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <CalendarIcon className="w-5 h-5 text-green-500" />
                                                Follow-up Instructions
                                            </h3>
                                            <Button type="button" variant="outline" size="sm" onClick={addFollowUpInstruction}>
                                                <PlusIcon className="w-3 h-3 mr-1" />
                                                Add Instruction
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            {formData.follow_up_instructions.map((instruction, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <Input
                                                        value={instruction}
                                                        onChange={(e) => updateFollowUpInstruction(index, e.target.value)}
                                                        placeholder="Enter follow-up instruction"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeFollowUpInstruction(index)}
                                                    >
                                                        <TrashIcon className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {formData.follow_up_instructions.length === 0 && (
                                                <p className="text-sm text-muted-foreground">No follow-up instructions added</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="next_visit_date">Next Visit Date</Label>
                                            <Input
                                                id="next_visit_date"
                                                type="date"
                                                value={formData.next_visit_date || ''}
                                                onChange={(e) => setFormData(prev => ({ ...prev, next_visit_date: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <FloppyDiskIcon className="w-4 h-4 mr-2" />
                                        Create Medical Record
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
