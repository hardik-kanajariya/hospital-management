import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    ArrowLeftIcon,
    PencilSimpleIcon,
    CalendarIcon,
    UserIcon,
    StethoscopeIcon,
    HeartIcon,
    PillIcon,
    TestTubeIcon,
    FileTextIcon,
    PrinterIcon,
    DownloadIcon,
    ActivityIcon,
    WarningIcon
} from '@phosphor-icons/react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { httpService } from '@/services/HttpService'
import { API_ENDPOINTS } from '@/lib/api-endpoints'

interface MedicalRecord {
    id: string
    record_id: string
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
    created_at: string
    updated_at: string
    patient?: {
        id: string
        name: string
        patient_id: string
        phone: string
        date_of_birth: string
        gender: string
        blood_group?: string
    }
    doctor?: {
        id: string
        name: string
        specialization: string
        license_number: string
    }
}

export default function ViewMedicalRecord() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMedicalRecord()
    }, [id])

    const fetchMedicalRecord = async () => {
        try {
            setLoading(true)

            if (!id) {
                toast.error('Medical record ID is required')
                return
            }

            const response = await httpService.get(API_ENDPOINTS.MEDICAL_RECORDS.BY_ID(id))

            if (response.success && response.data) {
                setMedicalRecord(response.data)
            } else {
                throw new Error(response.error || 'Failed to fetch medical record')
            }
        } catch (error) {
            console.error('Error fetching medical record:', error)
            toast.error('Failed to fetch medical record')
            // Navigate back if record not found
            setTimeout(() => navigate('/medical-records'), 2000)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
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

    const handlePrint = () => {
        window.print()
    }

    const handleDownload = () => {
        // PDF export via browser print dialog for now
        window.print();
        toast.success('Use your browser\'s print dialog to save as PDF');
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading medical record...</span>
            </div>
        )
    }

    if (!medicalRecord) {
        return (
            <div className="text-center py-8">
                <p className="text-destructive">Medical record not found</p>
                <Button variant="outline" onClick={() => navigate('/medical-records')} className="mt-4">
                    Back to Medical Records
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 print:space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div className="flex items-center gap-2">
                        <FileTextIcon className="w-6 h-6 text-primary" />
                        <div>
                            <h1 className="text-2xl font-bold">Medical Record</h1>
                            <p className="text-muted-foreground">{medicalRecord.record_id}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint}>
                        <PrinterIcon className="w-4 h-4 mr-2" />
                        Print
                    </Button>
                    <Button variant="outline" onClick={handleDownload}>
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                    <Button onClick={() => navigate(`/medical-records/${id}/edit`)}>
                        <PencilSimpleIcon className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                </div>
            </div>

            {/* Medical Record Content */}
            <div className="grid gap-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5" />
                            Visit Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-2">PATIENT</h4>
                                <div className="flex items-center gap-2 mb-1">
                                    <UserIcon className="w-4 h-4 text-blue-500" />
                                    <span className="font-medium">{medicalRecord.patient?.name}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    ID: {medicalRecord.patient?.patient_id}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Age: {medicalRecord.patient?.date_of_birth && calculateAge(medicalRecord.patient.date_of_birth)} years
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Gender: {medicalRecord.patient?.gender}
                                </p>
                                {medicalRecord.patient?.blood_group && (
                                    <p className="text-sm text-muted-foreground">
                                        Blood Group: {medicalRecord.patient.blood_group}
                                    </p>
                                )}
                            </div>

                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-2">DOCTOR</h4>
                                <div className="flex items-center gap-2 mb-1">
                                    <StethoscopeIcon className="w-4 h-4 text-green-500" />
                                    <span className="font-medium">{medicalRecord.doctor?.name}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {medicalRecord.doctor?.specialization}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    License: {medicalRecord.doctor?.license_number}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-2">VISIT DETAILS</h4>
                                <p className="text-sm mb-1">
                                    <strong>Date:</strong> {formatDate(medicalRecord.visit_date)}
                                </p>
                                <p className="text-sm mb-1">
                                    <strong>Record ID:</strong> {medicalRecord.record_id}
                                </p>
                                {medicalRecord.next_visit_date && (
                                    <p className="text-sm">
                                        <strong>Next Visit:</strong> {formatDate(medicalRecord.next_visit_date)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Vital Signs */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HeartIcon className="w-5 h-5 text-red-500" />
                            Vital Signs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            {medicalRecord.vital_signs && Object.entries(medicalRecord.vital_signs).map(([key, value]) => {
                                if (!value) return null
                                return (
                                    <div key={key} className="text-center">
                                        <p className="text-xs text-muted-foreground uppercase mb-1">
                                            {key.replace('_', ' ')}
                                        </p>
                                        <p className="font-medium">{value}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Diagnosis & Treatment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Diagnosis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm leading-relaxed">{medicalRecord.diagnosis}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Treatment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm leading-relaxed">{medicalRecord.treatment}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Medications */}
                {medicalRecord.medications && medicalRecord.medications.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PillIcon className="w-5 h-5 text-blue-500" />
                                Prescribed Medications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {medicalRecord.medications.map((medication, index) => (
                                    <div key={index} className="border rounded-lg p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="font-medium">{medication.name}</p>
                                                <p className="text-sm text-muted-foreground">{medication.dosage}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Frequency</p>
                                                <p className="font-medium">{medication.frequency}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Duration</p>
                                                <p className="font-medium">{medication.duration}</p>
                                            </div>
                                            <div className="md:col-span-1">
                                                <p className="text-sm text-muted-foreground">Instructions</p>
                                                <p className="text-sm">{medication.instructions}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Lab Results */}
                {medicalRecord.lab_results && medicalRecord.lab_results.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TestTubeIcon className="w-5 h-5 text-purple-500" />
                                Lab Results
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {medicalRecord.lab_results.map((result, index) => (
                                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <div className="flex-1">
                                            <p className="font-medium">{result.test_name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Normal: {result.normal_range}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{result.result}</p>
                                            <Badge
                                                variant={result.status === 'completed' ? 'default' : 'secondary'}
                                                className="text-xs"
                                            >
                                                {result.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Follow-up Instructions */}
                {medicalRecord.follow_up_instructions && medicalRecord.follow_up_instructions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Follow-up Instructions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {medicalRecord.follow_up_instructions.map((instruction, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                                        <span className="text-sm">{instruction}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Additional Notes */}
                {medicalRecord.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm leading-relaxed">{medicalRecord.notes}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Record Metadata */}
                <Card className="print:hidden">
                    <CardHeader>
                        <CardTitle>Record Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Created</p>
                                <p>{formatDate(medicalRecord.created_at)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Last Updated</p>
                                <p>{formatDate(medicalRecord.updated_at)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
