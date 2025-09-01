import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeftIcon,
    PencilSimpleIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    CalendarIcon,
    MapPinIcon,
    HeartIcon,
    ShieldIcon,
    SyringeIcon,
    WarningIcon,
    CurrencyDollarIcon,
    FileTextIcon,
    PlusIcon,
    ClockIcon,
    EyeIcon,
    PencilIcon,
    StethoscopeIcon,
    PillIcon,
    TestTubeIcon,
    ActivityIcon,
    PaperclipIcon,
    ArrowRightIcon,
} from '@phosphor-icons/react';
import { usePatient } from '@/hooks/usePatientApi'

export default function PatientProfile() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const { patient, loading, error, fetchPatient } = usePatient(id)

    const [activeTab, setActiveTab] = useState('overview')

    // Calculate age from date of birth with fallback for invalid values
    const calculateAge = (dateOfBirth: string | null | undefined) => {
        if (!dateOfBirth) return 'Not available'
        const birthDate = new Date(dateOfBirth)
        if (isNaN(birthDate.getTime())) return 'Invalid date'
        const age = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365))
        return age >= 0 ? `${age}` : 'Invalid date'
    }

    // Format date with fallback for invalid values
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'Not provided'
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return 'Invalid Date'
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    // Format currency with fallback for invalid values
    const formatCurrency = (amount: number | null | undefined) => {
        if (amount === null || amount === undefined || isNaN(amount)) return 'Not provided'
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount)
    }

    // Format string with fallback for empty values
    const formatString = (value: string | null | undefined) => {
        return value && value.trim() !== '' ? value : 'Not provided'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading patient details...</span>
            </div>
        )
    }

    if (error || !patient) {
        return (
            <div className="text-center py-8">
                <p className="text-destructive">Error loading patient details: {error}</p>
                <Button variant="outline" onClick={() => navigate('/patients')} className="mt-4">
                    Back to Patients
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => navigate('/patients')}>
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back to Patients
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{patient.name}</h1>
                        <p className="text-muted-foreground">Patient ID: {patient.patient_id}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(`/patients/${patient.id}/edit`)}>
                        <PencilSimpleIcon className="w-4 h-4 mr-2" />
                        Edit Patient
                    </Button>
                    <Button onClick={() => navigate(`/appointments/create?patientId=${patient.id}`)}>
                        <PlusIcon className="w-4 h-4 mr-2" />
                        New Appointment
                    </Button>
                </div>
            </div>

            {/* Patient Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <UserIcon className="w-8 h-8 text-blue-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Age</p>
                                <p className="text-lg font-semibold">
                                    {calculateAge(patient.date_of_birth) === 'Not available' || calculateAge(patient.date_of_birth) === 'Invalid date'
                                        ? calculateAge(patient.date_of_birth)
                                        : `${calculateAge(patient.date_of_birth)} years`
                                    }
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <HeartIcon className="w-8 h-8 text-red-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Blood Group</p>
                                <p className="text-lg font-semibold">{patient.blood_group || 'Not specified'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <CalendarIcon className="w-8 h-8 text-green-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Total Appointments</p>
                                <p className="text-lg font-semibold">{patient.appointments?.length || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <CurrencyDollarIcon className="w-8 h-8 text-orange-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Outstanding Bills</p>
                                <p className="text-lg font-semibold">
                                    {patient.bills?.filter(bill => bill.status !== 'paid').length || 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Card>
                <CardContent className="p-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="border-b px-6 pt-6">
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="medical">Medical Records</TabsTrigger>
                                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                                <TabsTrigger value="billing">Billing</TabsTrigger>
                                <TabsTrigger value="documents">Documents</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="p-6">
                            <TabsContent value="overview" className="space-y-6 mt-0">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Basic Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <UserIcon className="w-5 h-5" />
                                                Basic Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                                                    <p className="text-sm">{patient.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Gender</p>
                                                    <p className="text-sm capitalize">{patient.gender}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                                                    <p className="text-sm">{formatDate(patient.date_of_birth)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Age</p>
                                                    <p className="text-sm">
                                                        {calculateAge(patient.date_of_birth) === 'Not available' || calculateAge(patient.date_of_birth) === 'Invalid date'
                                                            ? calculateAge(patient.date_of_birth)
                                                            : `${calculateAge(patient.date_of_birth)} years`
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-1">Contact Information</p>
                                                <div className="space-y-2">
                                                    <p className="text-sm flex items-center gap-2">
                                                        <PhoneIcon className="w-4 h-4" />
                                                        {patient.phone}
                                                    </p>
                                                    {patient.email && (
                                                        <p className="text-sm flex items-center gap-2">
                                                            <EnvelopeIcon className="w-4 h-4" />
                                                            {patient.email}
                                                        </p>
                                                    )}
                                                    <p className="text-sm flex items-start gap-2">
                                                        <MapPinIcon className="w-4 h-4 mt-0.5" />
                                                        {patient.address}
                                                    </p>
                                                </div>``
                                            </div>

                                            {patient.blood_group && (
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground mb-1">Blood Group</p>
                                                    <Badge variant="outline" className="text-red-600 border-red-600">
                                                        <HeartIcon className="w-3 h-3 mr-1" />
                                                        {patient.blood_group}
                                                    </Badge>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Emergency Contact */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <PhoneIcon className="w-5 h-5" />
                                                Emergency Contact
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {patient.emergency_contact?.name ? (
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                                                    <p className="text-sm">{patient.emergency_contact.name}</p>
                                                </div>
                                            ) : null}
                                            {patient.emergency_contact?.relationship ? (
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Relationship</p>
                                                    <p className="text-sm">{patient.emergency_contact.relationship}</p>
                                                </div>
                                            ) : null}
                                            {patient.emergency_contact?.phone ? (
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                                    <p className="text-sm">{patient.emergency_contact.phone}</p>
                                                </div>
                                            ) : null}
                                            {patient.emergency_contact?.email && (
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                                                    <p className="text-sm">{patient.emergency_contact.email}</p>
                                                </div>
                                            )}
                                            {(!patient.emergency_contact?.name && !patient.emergency_contact?.phone) && (
                                                <div className="text-center py-4 text-muted-foreground">
                                                    <p className="text-sm">No emergency contact information available</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Medical Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <HeartIcon className="w-5 h-5" />
                                                Medical Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {patient.allergies && patient.allergies.length > 0 && (
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground mb-2">Allergies</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {patient.allergies.map((allergy, index) => (
                                                            <Badge key={index} variant="outline" className="text-red-600 border-red-600">
                                                                <WarningIcon className="w-3 h-3 mr-1" />
                                                                {allergy}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {patient.chronic_conditions && patient.chronic_conditions.length > 0 && (
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground mb-2">Chronic Conditions</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {patient.chronic_conditions.map((condition, index) => (
                                                            <Badge key={index} variant="outline" className="text-orange-600 border-orange-600">
                                                                {condition}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {(!patient.allergies || patient.allergies.length === 0) &&
                                                (!patient.chronic_conditions || patient.chronic_conditions.length === 0) && (
                                                    <p className="text-sm text-muted-foreground">No allergies or chronic conditions recorded</p>
                                                )}
                                        </CardContent>
                                    </Card>

                                    {/* Insurance Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <ShieldIcon className="w-5 h-5" />
                                                Insurance Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Provider</p>
                                                    <p className="text-sm">{formatString(patient.insurance_info?.provider)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Policy Number</p>
                                                    <p className="text-sm">{formatString(patient.insurance_info?.policy_number)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Coverage Amount</p>
                                                    <p className="text-sm">{formatCurrency(patient.insurance_info?.coverage_amount)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Expiry Date</p>
                                                    <p className="text-sm">{formatDate(patient.insurance_info?.expiry_date)}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Vaccination Records */}
                                {patient.vaccination_records && patient.vaccination_records.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <SyringeIcon className="w-5 h-5" />
                                                Vaccination Records
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {patient.vaccination_records.map((vaccination, index) => (
                                                    <div key={index} className="border rounded-lg p-4">
                                                        <div className="space-y-2">
                                                            <div>
                                                                <p className="text-sm font-medium">{formatString(vaccination.vaccine_name)}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Administered: {formatDate(vaccination.date_administered)}
                                                                </p>
                                                            </div>
                                                            {vaccination.next_due_date && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    Next due: {formatDate(vaccination.next_due_date)}
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-muted-foreground">
                                                                By: {formatString(vaccination.administered_by)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="medical" className="space-y-6 mt-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold">Medical Records</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Complete medical history and treatment records
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => navigate('/medical-records', { state: { patientId: patient.id } })}
                                        >
                                            <FileTextIcon className="w-4 h-4 mr-2" />
                                            View All Records
                                        </Button>
                                        <Button onClick={() => navigate(`/medical-records/create?patientId=${patient.id}`)}>
                                            <PlusIcon className="w-4 h-4 mr-2" />
                                            Add Medical Record
                                        </Button>
                                    </div>
                                </div>

                                {patient.medicalRecords && patient.medicalRecords.length > 0 ? (
                                    <div className="space-y-6">
                                        {/* Records Summary */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <Card className="p-4">
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-primary">{patient.medicalRecords.length}</p>
                                                    <p className="text-sm text-muted-foreground">Total Records</p>
                                                </div>
                                            </Card>
                                            <Card className="p-4">
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {patient.medicalRecords.filter((r: any) => r.medications && r.medications.length > 0).length}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">With Medications</p>
                                                </div>
                                            </Card>
                                            <Card className="p-4">
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-green-600">
                                                        {patient.medicalRecords.filter((r: any) => r.labResults && r.labResults.length > 0).length}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">With Lab Results</p>
                                                </div>
                                            </Card>
                                            <Card className="p-4">
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-orange-600">
                                                        {patient.medicalRecords.filter((r: any) => r.followUpInstructions && r.followUpInstructions.length > 0).length}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">With Follow-ups</p>
                                                </div>
                                            </Card>
                                        </div>

                                        {/* Medical Records Timeline */}
                                        <div className="space-y-4">
                                            <h4 className="text-md font-semibold flex items-center gap-2">
                                                <ClockIcon className="w-4 h-4" />
                                                Recent Medical Records
                                            </h4>
                                            
                                            {patient.medicalRecords
                                                .sort((a: any, b: any) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
                                                .slice(0, 5)
                                                .map((record: any, index: number) => (
                                                <Card key={record.id} className="relative">
                                                    {/* Timeline indicator */}
                                                    {index < (patient.medicalRecords?.length || 0) - 1 && (
                                                        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border"></div>
                                                    )}
                                                    
                                                    <CardContent className="p-6">
                                                        <div className="flex items-start gap-4">
                                                            {/* Timeline dot */}
                                                            <div className="flex-shrink-0 w-3 h-3 bg-primary rounded-full mt-2"></div>
                                                            
                                                            <div className="flex-1 min-w-0">
                                                                {/* Header */}
                                                                <div className="flex items-start justify-between mb-4">
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <Badge variant="outline" className="text-xs">
                                                                                {record.recordId}
                                                                            </Badge>
                                                                            <span className="text-sm font-medium">
                                                                                {formatDate(record.visitDate)}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            Doctor ID: {record.doctorId}
                                                                            {record.appointmentId && ` • Appointment: ${record.appointmentId}`}
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="sm"
                                                                            onClick={() => navigate(`/medical-records/${record.id}`)}
                                                                        >
                                                                            <EyeIcon className="w-4 h-4 mr-1" />
                                                                            View
                                                                        </Button>
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="sm"
                                                                            onClick={() => navigate(`/medical-records/${record.id}/edit`)}
                                                                        >
                                                                            <PencilIcon className="w-4 h-4 mr-1" />
                                                                            Edit
                                                                        </Button>
                                                                    </div>
                                                                </div>

                                                                {/* Diagnosis & Treatment */}
                                                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <StethoscopeIcon className="w-4 h-4 text-red-500" />
                                                                            <h5 className="font-medium text-sm">Diagnosis</h5>
                                                                        </div>
                                                                        <p className="text-sm pl-6">{record.diagnosis}</p>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <HeartIcon className="w-4 h-4 text-blue-500" />
                                                                            <h5 className="font-medium text-sm">Treatment</h5>
                                                                        </div>
                                                                        <p className="text-sm pl-6">{record.treatment}</p>
                                                                    </div>
                                                                </div>

                                                                {/* Quick Info Grid */}
                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                                    {/* Medications */}
                                                                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                                                                        <PillIcon className="w-5 h-5 mx-auto mb-1 text-green-600" />
                                                                        <p className="text-sm font-medium">
                                                                            {record.medications ? record.medications.length : 0}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">Medications</p>
                                                                    </div>

                                                                    {/* Lab Results */}
                                                                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                                                                        <TestTubeIcon className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                                                                        <p className="text-sm font-medium">
                                                                            {record.labResults ? record.labResults.length : 0}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">Lab Results</p>
                                                                    </div>

                                                                    {/* Vital Signs */}
                                                                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                                                                        <ActivityIcon className="w-5 h-5 mx-auto mb-1 text-red-600" />
                                                                        <p className="text-sm font-medium">
                                                                            {record.vitalSigns && Object.keys(record.vitalSigns).length > 0 ? 'Yes' : 'No'}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">Vital Signs</p>
                                                                    </div>

                                                                    {/* Attachments */}
                                                                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                                                                        <PaperclipIcon className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                                                                        <p className="text-sm font-medium">
                                                                            {record.attachments ? record.attachments.length : 0}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">Attachments</p>
                                                                    </div>
                                                                </div>

                                                                {/* Follow-up Instructions */}
                                                                {record.followUpInstructions && record.followUpInstructions.length > 0 && (
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <CalendarIcon className="w-4 h-4 text-orange-500" />
                                                                            <h5 className="font-medium text-sm">Follow-up Instructions</h5>
                                                                        </div>
                                                                        <ul className="text-sm pl-6 space-y-1">
                                                                            {record.followUpInstructions.slice(0, 2).map((instruction: string, idx: number) => (
                                                                                <li key={idx} className="list-disc">{instruction}</li>
                                                                            ))}
                                                                            {record.followUpInstructions.length > 2 && (
                                                                                <li className="text-muted-foreground">
                                                                                    +{record.followUpInstructions.length - 2} more instructions
                                                                                </li>
                                                                            )}
                                                                        </ul>
                                                                    </div>
                                                                )}

                                                                {/* Next Visit Date */}
                                                                {record.nextVisitDate && (
                                                                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                                        <div className="flex items-center gap-2">
                                                                            <CalendarIcon className="w-4 h-4 text-blue-600" />
                                                                            <span className="text-sm font-medium text-blue-800">
                                                                                Next Visit: {formatDate(record.nextVisitDate)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Notes */}
                                                                {record.notes && (
                                                                    <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                                                                        <div className="flex items-start gap-2">
                                                                            <FileTextIcon className="w-4 h-4 text-muted-foreground mt-0.5" />
                                                                            <div>
                                                                                <h5 className="font-medium text-sm mb-1">Clinical Notes</h5>
                                                                                <p className="text-sm text-muted-foreground">{record.notes}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}

                                            {/* Show More Button */}
                                            {patient.medicalRecords.length > 5 && (
                                                <div className="text-center pt-4">
                                                    <Button 
                                                        variant="outline"
                                                        onClick={() => navigate('/medical-records', { state: { patientId: patient.id } })}
                                                    >
                                                        View All {patient.medicalRecords.length} Medical Records
                                                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                                            <FileTextIcon className="w-12 h-12 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-medium mb-2">No Medical Records</h3>
                                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                            This patient doesn't have any medical records yet. Create the first medical record to start tracking their medical history.
                                        </p>
                                        <Button onClick={() => navigate(`/medical-records/create?patientId=${patient.id}`)}>
                                            <PlusIcon className="w-4 h-4 mr-2" />
                                            Create First Medical Record
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="appointments" className="space-y-4 mt-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Appointments</h3>
                                    <Button onClick={() => navigate(`/appointments/create?patientId=${patient.id}`)}>
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Schedule Appointment
                                    </Button>
                                </div>

                                {patient.appointments && patient.appointments.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date & Time</TableHead>
                                                <TableHead>Doctor</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Reason</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {patient.appointments.map((appointment) => (
                                                <TableRow key={appointment.id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{formatDate(appointment.appointment_date)}</p>
                                                            <p className="text-sm text-muted-foreground">{appointment.appointment_time}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{appointment.doctor?.name || 'Unknown'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{appointment.type}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={appointment.status === 'completed' ? 'default' :
                                                                appointment.status === 'cancelled' ? 'destructive' : 'secondary'}
                                                        >
                                                            {appointment.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{appointment.reason}</TableCell>
                                                    <TableCell>
                                                        <Button variant="outline" size="sm">
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No appointments scheduled</p>
                                        <p className="text-sm">Schedule an appointment to get started</p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="billing" className="space-y-4 mt-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Billing History</h3>
                                    <Button onClick={() => navigate(`/billing/create?patientId=${patient.id}`)}>
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Create Bill
                                    </Button>
                                </div>

                                {patient.bills && patient.bills.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Bill Number</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Paid</TableHead>
                                                <TableHead>Balance</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {patient.bills.map((bill) => (
                                                <TableRow key={bill.id}>
                                                    <TableCell className="font-medium">{bill.bill_number}</TableCell>
                                                    <TableCell>{formatDate(bill.bill_date)}</TableCell>
                                                    <TableCell>{formatCurrency(bill.total_amount)}</TableCell>
                                                    <TableCell>{formatCurrency(bill.paid_amount)}</TableCell>
                                                    <TableCell>{formatCurrency(bill.balance_amount)}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={bill.status === 'paid' ? 'default' :
                                                                bill.status === 'overdue' ? 'destructive' : 'secondary'}
                                                        >
                                                            {bill.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="outline" size="sm">
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <CurrencyDollarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No billing records found</p>
                                        <p className="text-sm">Billing records will appear here after services</p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="documents" className="space-y-4 mt-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Documents</h3>
                                    <Button>
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Upload Document
                                    </Button>
                                </div>

                                <div className="text-center py-8 text-muted-foreground">
                                    <FileTextIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No documents uploaded</p>
                                    <p className="text-sm">Upload medical documents, reports, and images</p>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
