import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { useParams, useNavigate } from 'react-router-dom'
import {
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    CalendarIcon,
    MapPinIcon,
    HeartIcon,
    ShieldIcon,
    FileTextIcon,
    ChatCircleIcon,
    ClockIcon,
    WarningIcon,
    PencilIcon,
    PrinterIcon,
    ShareIcon,
    BellIcon,
    CameraIcon,
    ArticleIcon,
    PillIcon,
    SyringeIcon,
    UsersIcon,
    EyeIcon,
    CreditCardIcon,
    ChartBarIcon
} from '@phosphor-icons/react'
import { Patient } from '@/types/patient'

interface TimelineEvent {
    id: string
    type: 'appointment' | 'medical_record' | 'bill' | 'allergy' | 'medication' | 'document'
    date: string
    title: string
    description: string
    status?: string
    icon: React.ReactNode
    color: string
}

export default function EnhancedPatientProfile() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    
    const [patient, setPatient] = useState<Patient | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('overview')
    const [timeline, setTimeline] = useState<TimelineEvent[]>([])
    const [alerts, setAlerts] = useState<Array<{ type: 'warning' | 'info' | 'error', message: string }>>([])

    useEffect(() => {
        if (id) {
            fetchCompleteProfile()
            fetchTimeline()
        }
    }, [id])

    const fetchCompleteProfile = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/patients/${id}/complete-profile`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch patient profile')
            }

            const data = await response.json()
            if (data.success) {
                setPatient(data.data)
                generateAlerts(data.data)
            } else {
                throw new Error(data.message || 'Failed to fetch patient profile')
            }
        } catch (error) {
            console.error('Error fetching patient profile:', error)
            setError(error instanceof Error ? error.message : 'Failed to fetch patient profile')
            toast.error('Failed to load patient profile')
        } finally {
            setLoading(false)
        }
    }

    const fetchTimeline = async () => {
        try {
            const response = await fetch(`/api/patients/${id}/timeline`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch timeline')
            }

            const data = await response.json()
            if (data.success) {
                const formattedTimeline: TimelineEvent[] = data.data.timeline.map((event: any) => {
                    switch (event.type) {
                        case 'appointment':
                            return {
                                id: event.data.id,
                                type: 'appointment',
                                date: event.date,
                                title: 'Appointment',
                                description: `${event.data.status} - ${event.data.notes || 'No notes'}`,
                                status: event.data.status,
                                icon: <CalendarIcon className="w-4 h-4" />,
                                color: 'blue'
                            }
                        case 'medical_record':
                            return {
                                id: event.data.id,
                                type: 'medical_record',
                                date: event.date,
                                title: 'Medical Record',
                                description: `Diagnosis: ${event.data.diagnosis || 'N/A'}`,
                                icon: <FileTextIcon className="w-4 h-4" />,
                                color: 'green'
                            }
                        case 'bill':
                            return {
                                id: event.data.id,
                                type: 'bill',
                                date: event.date,
                                title: 'Bill',
                                description: `Amount: $${event.data.total_amount} - ${event.data.status}`,
                                status: event.data.status,
                                icon: <CreditCardIcon className="w-4 h-4" />,
                                color: 'orange'
                            }
                        default:
                            return {
                                id: event.data.id,
                                type: event.type,
                                date: event.date,
                                title: event.type,
                                description: 'Event',
                                icon: <ClockIcon className="w-4 h-4" />,
                                color: 'gray'
                            }
                    }
                })
                setTimeline(formattedTimeline)
            }
        } catch (error) {
            console.error('Error fetching timeline:', error)
        }
    }

    const generateAlerts = (patientData: Patient) => {
        const alerts: Array<{ type: 'warning' | 'info' | 'error', message: string }> = []

        // Check for critical allergies
        if (patientData.allergyRecords?.some((allergy: any) => allergy.severity === 'severe')) {
            alerts.push({
                type: 'error',
                message: 'Patient has severe allergies - Check before prescribing medications'
            })
        }

        // Check for missing insurance
        if (!patientData.insurances || patientData.insurances.length === 0) {
            alerts.push({
                type: 'warning',
                message: 'No insurance information on file'
            })
        }

        // Check for incomplete medical history
        if (!patientData.currentMedications || patientData.currentMedications.length === 0) {
            alerts.push({
                type: 'info',
                message: 'Current medications not documented'
            })
        }

        // Check for missing emergency contact
        if (!patientData.demographics?.emergency_contact_1?.name) {
            alerts.push({
                type: 'warning',
                message: 'Emergency contact information incomplete'
            })
        }

        setAlerts(alerts)
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

    const printProfile = () => {
        window.print()
        toast.success('Profile sent to printer')
    }

    const shareProfile = () => {
        if (navigator.share) {
            navigator.share({
                title: `${patient?.name} - Patient Profile`,
                text: `Patient profile for ${patient?.name}`,
                url: window.location.href
            })
        } else {
            navigator.clipboard.writeText(window.location.href)
            toast.success('Profile link copied to clipboard')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading patient profile...</p>
                </div>
            </div>
        )
    }

    if (error || !patient) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <WarningIcon className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Unable to Load Profile</h3>
                    <p className="text-muted-foreground mb-4">{error || 'Patient not found'}</p>
                    <Button onClick={() => navigate('/hospital/patients')}>
                        Back to Patients
                    </Button>
                </div>
            </div>
        )
    }

    const age = calculateAge(patient.date_of_birth)

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card border-b">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-6">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={patient.photo || ''} alt={patient.name} />
                                <AvatarFallback className="text-2xl">
                                    {patient.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            
                            <div className="space-y-1">
                                <h1 className="text-3xl font-bold">{patient.name}</h1>
                                <div className="flex items-center gap-4 text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <UserIcon className="w-4 h-4" />
                                        ID: {patient.patient_id}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <CalendarIcon className="w-4 h-4" />
                                        {age} years old
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <HeartIcon className="w-4 h-4" />
                                        {patient.blood_group || 'Unknown'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={patient.gender === 'male' ? 'default' : patient.gender === 'female' ? 'secondary' : 'outline'}>
                                        {patient.gender}
                                    </Badge>
                                    {patient.blood_group && (
                                        <Badge variant="outline">{patient.blood_group}</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={printProfile}>
                                <PrinterIcon className="w-4 h-4 mr-2" />
                                Print
                            </Button>
                            <Button variant="outline" size="sm" onClick={shareProfile}>
                                <ShareIcon className="w-4 h-4 mr-2" />
                                Share
                            </Button>
                            <Button size="sm" onClick={() => navigate(`/hospital/patients/${id}/edit`)}>
                                <PencilIcon className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-6">
                {/* Alerts */}
                {alerts.length > 0 && (
                    <div className="space-y-2 mb-6">
                        {alerts.map((alert, index) => (
                            <Alert key={index} variant={alert.type === 'error' ? 'destructive' : 'default'}>
                                <BellIcon className="h-4 w-4" />
                                <AlertDescription>{alert.message}</AlertDescription>
                            </Alert>
                        ))}
                    </div>
                )}

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="medical">Medical History</TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                        <TabsTrigger value="insurance">Insurance</TabsTrigger>
                        <TabsTrigger value="communications">Communications</TabsTrigger>
                        <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Patient Information */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserIcon className="w-5 h-5" />
                                        Patient Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                            <p className="font-medium">{patient.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                                            <p className="font-medium">{new Date(patient.date_of_birth).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                            <p className="font-medium flex items-center gap-2">
                                                <PhoneIcon className="w-4 h-4" />
                                                {patient.phone}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                                            <p className="font-medium flex items-center gap-2">
                                                <EnvelopeIcon className="w-4 h-4" />
                                                {patient.email || 'Not provided'}
                                            </p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-medium text-muted-foreground">Address</label>
                                            <p className="font-medium flex items-center gap-2">
                                                <MapPinIcon className="w-4 h-4" />
                                                {patient.address}
                                            </p>
                                        </div>
                                    </div>

                                    {patient.demographics && (
                                        <>
                                            <Separator />
                                            <div>
                                                <h4 className="font-semibold mb-3">Demographics</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-sm font-medium text-muted-foreground">Marital Status</label>
                                                        <p className="font-medium">{patient.demographics.marital_status || 'Not specified'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-muted-foreground">Occupation</label>
                                                        <p className="font-medium">{patient.demographics.occupation || 'Not specified'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-muted-foreground">Primary Language</label>
                                                        <p className="font-medium">{patient.demographics.primary_language || 'Not specified'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-muted-foreground">Preferred Contact</label>
                                                        <p className="font-medium">{patient.demographics.preferred_contact_method || 'Not specified'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {patient.demographics?.emergency_contact_1?.name && (
                                        <>
                                            <Separator />
                                            <div>
                                                <h4 className="font-semibold mb-3">Emergency Contact</h4>
                                                <div className="space-y-2">
                                                    <p className="font-medium">{patient.demographics.emergency_contact_1.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {patient.demographics.emergency_contact_1.relationship} • {patient.demographics.emergency_contact_1.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Quick Stats */}
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ChartBarIcon className="w-5 h-5" />
                                            Quick Stats
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Active Allergies</span>
                                            <Badge variant={patient.allergyRecords?.length ? "destructive" : "secondary"}>
                                                {patient.allergyRecords?.length || 0}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Current Medications</span>
                                            <Badge variant="outline">
                                                {patient.currentMedications?.length || 0}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Insurance Plans</span>
                                            <Badge variant={patient.insurances?.length ? "default" : "secondary"}>
                                                {patient.insurances?.length || 0}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Documents</span>
                                            <Badge variant="outline">
                                                {patient.documents?.length || 0}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ClockIcon className="w-5 h-5" />
                                            Recent Activity
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {timeline.length > 0 ? (
                                            <div className="space-y-3">
                                                {timeline.slice(0, 3).map((event) => (
                                                    <div key={event.id} className="flex items-start gap-3">
                                                        <div className={`p-1 rounded-full bg-${event.color}-100`}>
                                                            {event.icon}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium">{event.title}</p>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {new Date(event.date).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No recent activity</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Medical History Tab */}
                    <TabsContent value="medical" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Allergies */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <WarningIcon className="w-5 h-5" />
                                        Allergies
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {patient.allergyRecords && patient.allergyRecords.length > 0 ? (
                                        <div className="space-y-3">
                                            {patient.allergyRecords.map((allergy: any, index: number) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{allergy.allergen}</p>
                                                        <p className="text-sm text-muted-foreground">{allergy.reaction_type}</p>
                                                    </div>
                                                    <Badge variant={
                                                        allergy.severity === 'severe' ? 'destructive' :
                                                        allergy.severity === 'moderate' ? 'default' : 'secondary'
                                                    }>
                                                        {allergy.severity}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">No known allergies</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Current Medications */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <PillIcon className="w-5 h-5" />
                                        Current Medications
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {patient.currentMedications && patient.currentMedications.length > 0 ? (
                                        <div className="space-y-3">
                                            {patient.currentMedications.map((medication: any, index: number) => (
                                                <div key={index} className="p-3 bg-muted rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="font-medium">{medication.medication_name}</p>
                                                        <Badge variant="outline">{medication.status}</Badge>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground space-y-1">
                                                        <p>Dosage: {medication.dosage}</p>
                                                        <p>Frequency: {medication.frequency}</p>
                                                        {medication.prescribed_by && (
                                                            <p>Prescribed by: {medication.prescribed_by}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">No current medications</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Immunizations */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <SyringeIcon className="w-5 h-5" />
                                        Immunizations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {patient.immunizations && patient.immunizations.length > 0 ? (
                                        <div className="space-y-3">
                                            {patient.immunizations.map((immunization: any, index: number) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{immunization.vaccine_name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(immunization.date_administered).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline">
                                                        {immunization.dose_number ? `Dose ${immunization.dose_number}` : 'Complete'}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">No immunization records</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Family History */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UsersIcon className="w-5 h-5" />
                                        Family History
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {patient.familyHistory && patient.familyHistory.length > 0 ? (
                                        <div className="space-y-3">
                                            {patient.familyHistory.map((history: any, index: number) => (
                                                <div key={index} className="p-3 bg-muted rounded-lg">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="font-medium">{history.condition}</p>
                                                        <Badge variant="outline">{history.relationship}</Badge>
                                                    </div>
                                                    {history.age_at_diagnosis && (
                                                        <p className="text-sm text-muted-foreground">
                                                            Age at diagnosis: {history.age_at_diagnosis}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">No family history recorded</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <FileTextIcon className="w-5 h-5" />
                                        Patient Documents
                                    </CardTitle>
                                    <Button size="sm">
                                        <FileTextIcon className="w-4 h-4 mr-2" />
                                        Upload Document
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {patient.documents && patient.documents.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {patient.documents.map((document: any, index: number) => (
                                            <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                                                <div className="flex items-start justify-between mb-3">
                                                    <FileTextIcon className="w-8 h-8 text-muted-foreground" />
                                                    <Button variant="ghost" size="sm">
                                                        <EyeIcon className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <h4 className="font-medium mb-1">{document.title}</h4>
                                                <p className="text-sm text-muted-foreground mb-2">{document.document_type}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(document.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <FileTextIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No documents uploaded</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Insurance Tab */}
                    <TabsContent value="insurance" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <ShieldIcon className="w-5 h-5" />
                                        Insurance Information
                                    </CardTitle>
                                    <Button size="sm">
                                        <ShieldIcon className="w-4 h-4 mr-2" />
                                        Add Insurance
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {patient.insurances && patient.insurances.length > 0 ? (
                                    <div className="space-y-4">
                                        {patient.insurances.map((insurance: any, index: number) => (
                                            <div key={index} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-semibold">{insurance.provider_name}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={insurance.insurance_type === 'primary' ? 'default' : 'outline'}>
                                                            {insurance.insurance_type}
                                                        </Badge>
                                                        <Badge variant={insurance.status === 'active' ? 'default' : 'secondary'}>
                                                            {insurance.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <label className="text-muted-foreground">Policy Number</label>
                                                        <p className="font-medium">{insurance.policy_number}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-muted-foreground">Group Number</label>
                                                        <p className="font-medium">{insurance.group_number || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-muted-foreground">Effective Date</label>
                                                        <p className="font-medium">
                                                            {new Date(insurance.effective_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="text-muted-foreground">Expiry Date</label>
                                                        <p className="font-medium">
                                                            {insurance.expiry_date ? new Date(insurance.expiry_date).toLocaleDateString() : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <ShieldIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No insurance information on file</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Communications Tab */}
                    <TabsContent value="communications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ChatCircleIcon className="w-5 h-5" />
                                    Communication Preferences
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {patient.communicationPreferences ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="font-semibold mb-3">Appointment Reminders</h4>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm">Enabled</span>
                                                        <Badge variant={patient.communicationPreferences.appointment_reminders ? 'default' : 'secondary'}>
                                                            {patient.communicationPreferences.appointment_reminders ? 'Yes' : 'No'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm">Method</span>
                                                        <Badge variant="outline">
                                                            {patient.communicationPreferences.appointment_reminder_method}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm">Timing</span>
                                                        <span className="text-sm text-muted-foreground">
                                                            {patient.communicationPreferences.appointment_reminder_timing} hours before
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <h4 className="font-semibold mb-3">Lab Results</h4>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm">Notifications</span>
                                                        <Badge variant={patient.communicationPreferences.lab_results_notification ? 'default' : 'secondary'}>
                                                            {patient.communicationPreferences.lab_results_notification ? 'Yes' : 'No'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm">Method</span>
                                                        <Badge variant="outline">
                                                            {patient.communicationPreferences.lab_results_method}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <Separator />
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Marketing Communications</span>
                                                <Badge variant={patient.communicationPreferences.marketing_communications ? 'default' : 'secondary'}>
                                                    {patient.communicationPreferences.marketing_communications ? 'Yes' : 'No'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Health Tips</span>
                                                <Badge variant={patient.communicationPreferences.health_tips ? 'default' : 'secondary'}>
                                                    {patient.communicationPreferences.health_tips ? 'Yes' : 'No'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Survey Participation</span>
                                                <Badge variant={patient.communicationPreferences.survey_participation ? 'default' : 'secondary'}>
                                                    {patient.communicationPreferences.survey_participation ? 'Yes' : 'No'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">Communication preferences not set</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Timeline Tab */}
                    <TabsContent value="timeline" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ClockIcon className="w-5 h-5" />
                                    Medical Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {timeline.length > 0 ? (
                                    <ScrollArea className="h-[600px]">
                                        <div className="space-y-4">
                                            {timeline.map((event, index) => (
                                                <div key={event.id} className="flex items-start gap-4">
                                                    <div className={`p-2 rounded-full bg-${event.color}-100 text-${event.color}-600`}>
                                                        {event.icon}
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-medium">{event.title}</h4>
                                                            <span className="text-sm text-muted-foreground">
                                                                {new Date(event.date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{event.description}</p>
                                                        {event.status && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {event.status}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                ) : (
                                    <div className="text-center py-8">
                                        <ClockIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No timeline events</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
