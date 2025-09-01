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

                            <TabsContent value="medical" className="space-y-4 mt-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Medical Records</h3>
                                    <Button onClick={() => navigate(`/medical-records/create?patientId=${patient.id}`)}>
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Add Medical Record
                                    </Button>
                                </div>

                                {patient.medicalRecords && patient.medicalRecords.length > 0 ? (
                                    <div className="space-y-4">
                                        {patient.medicalRecords.map((record) => (
                                            <Card key={record.id}>
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="space-y-2">
                                                            <div>
                                                                <p className="font-medium">{record.chief_complaint}</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {formatDate(record.visit_date)} • Dr. {record.doctor?.name || 'Unknown'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm"><strong>Diagnosis:</strong> {record.diagnosis}</p>
                                                                <p className="text-sm"><strong>Treatment:</strong> {record.treatment}</p>
                                                            </div>
                                                            {record.notes && (
                                                                <p className="text-sm text-muted-foreground">{record.notes}</p>
                                                            )}
                                                        </div>
                                                        <Button variant="outline" size="sm">
                                                            <FileTextIcon className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <FileTextIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No medical records found</p>
                                        <p className="text-sm">Medical records will appear here after appointments</p>
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
