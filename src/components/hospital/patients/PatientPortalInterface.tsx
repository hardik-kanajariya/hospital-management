import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import {
    UserIcon,
    CalendarIcon,
    FileTextIcon,
    HeartIcon,
    ChatCircleIcon,
    BellIcon,
    EyeIcon,
    DownloadIcon,
    PlusIcon,
    ClockIcon,
    PhoneIcon,
    EnvelopeIcon,
    ShieldIcon,
    MagnifyingGlassIcon,
    StarIcon,
    MapPinIcon,
    CreditCardIcon,
    QuestionIcon,
    BookOpenIcon,
    VideoIcon,
    DeviceTabletIcon,
    PillIcon,
    SyringeIcon,
    WifiHighIcon,
    LockIcon
} from '@phosphor-icons/react'

interface PortalAppointment {
    id: string
    date: string
    time: string
    doctorName: string
    department: string
    type: string
    status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
    notes?: string
    location: string
}

interface LabResult {
    id: string
    testName: string
    date: string
    status: 'completed' | 'pending' | 'in-progress'
    results?: {
        parameter: string
        value: string
        normalRange: string
        flag?: 'high' | 'low' | 'normal'
    }[]
    doctorNotes?: string
    downloadUrl?: string
}

interface HealthRecord {
    id: string
    date: string
    type: 'visit' | 'diagnosis' | 'prescription' | 'procedure'
    title: string
    description: string
    provider: string
    documents?: string[]
}

interface Medication {
    id: string
    name: string
    dosage: string
    frequency: string
    prescribedBy: string
    startDate: string
    endDate?: string
    status: 'active' | 'completed' | 'discontinued'
    instructions: string
    refillsLeft: number
}

interface BillingRecord {
    id: string
    date: string
    description: string
    amount: number
    status: 'paid' | 'pending' | 'overdue'
    dueDate?: string
    insuranceCoverage?: number
    patientResponsibility: number
}

export default function PatientPortalInterface() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')
    
    // Data states
    const [appointments, setAppointments] = useState<PortalAppointment[]>([])
    const [labResults, setLabResults] = useState<LabResult[]>([])
    const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([])
    const [medications, setMedications] = useState<Medication[]>([])
    const [billing, setBilling] = useState<BillingRecord[]>([])
    
    // Form states
    const [appointmentRequest, setAppointmentRequest] = useState({
        preferredDate: '',
        preferredTime: '',
        department: '',
        reason: '',
        urgency: 'routine'
    })
    
    const [messageToProvider, setMessageToProvider] = useState({
        subject: '',
        message: '',
        department: ''
    })

    useEffect(() => {
        fetchPortalData()
    }, [])

    const fetchPortalData = async () => {
        setLoading(true)
        try {
            await Promise.all([
                fetchAppointments(),
                fetchLabResults(),
                fetchHealthRecords(),
                fetchMedications(),
                fetchBilling()
            ])
        } catch (error) {
            console.error('Error fetching portal data:', error)
            toast.error('Failed to load patient portal data')
        } finally {
            setLoading(false)
        }
    }

    const fetchAppointments = async () => {
        // Mock data - replace with actual API call
        const mockAppointments: PortalAppointment[] = [
            {
                id: 'apt-1',
                date: '2024-02-15',
                time: '10:00 AM',
                doctorName: 'Dr. Sarah Wilson',
                department: 'Cardiology',
                type: 'Follow-up',
                status: 'scheduled',
                location: 'Medical Center - Room 205'
            },
            {
                id: 'apt-2',
                date: '2024-01-20',
                time: '2:30 PM',
                doctorName: 'Dr. Michael Chen',
                department: 'Internal Medicine',
                type: 'Annual Check-up',
                status: 'completed',
                notes: 'Patient is in good health. Continue current medications.',
                location: 'Medical Center - Room 101'
            }
        ]
        setAppointments(mockAppointments)
    }

    const fetchLabResults = async () => {
        const mockLabResults: LabResult[] = [
            {
                id: 'lab-1',
                testName: 'Complete Blood Count',
                date: '2024-01-18',
                status: 'completed',
                results: [
                    { parameter: 'Hemoglobin', value: '14.2', normalRange: '12.0-15.5 g/dL', flag: 'normal' },
                    { parameter: 'White Blood Cells', value: '7.8', normalRange: '4.5-11.0 K/uL', flag: 'normal' },
                    { parameter: 'Platelets', value: '320', normalRange: '150-450 K/uL', flag: 'normal' }
                ],
                doctorNotes: 'All values within normal limits. Continue current treatment plan.'
            },
            {
                id: 'lab-2',
                testName: 'Lipid Panel',
                date: '2024-01-15',
                status: 'completed',
                results: [
                    { parameter: 'Total Cholesterol', value: '195', normalRange: '<200 mg/dL', flag: 'normal' },
                    { parameter: 'LDL Cholesterol', value: '118', normalRange: '<100 mg/dL', flag: 'high' },
                    { parameter: 'HDL Cholesterol', value: '58', normalRange: '>40 mg/dL', flag: 'normal' }
                ],
                doctorNotes: 'LDL slightly elevated. Recommend dietary modifications and follow-up in 3 months.'
            }
        ]
        setLabResults(mockLabResults)
    }

    const fetchHealthRecords = async () => {
        const mockHealthRecords: HealthRecord[] = [
            {
                id: 'record-1',
                date: '2024-01-20',
                type: 'visit',
                title: 'Annual Physical Examination',
                description: 'Comprehensive physical examination with vital signs, systems review, and preventive care counseling.',
                provider: 'Dr. Michael Chen'
            },
            {
                id: 'record-2',
                date: '2024-01-15',
                type: 'diagnosis',
                title: 'Mild Hypertension',
                description: 'Blood pressure readings consistently elevated. Lifestyle modifications recommended.',
                provider: 'Dr. Sarah Wilson'
            }
        ]
        setHealthRecords(mockHealthRecords)
    }

    const fetchMedications = async () => {
        const mockMedications: Medication[] = [
            {
                id: 'med-1',
                name: 'Lisinopril',
                dosage: '10mg',
                frequency: 'Once daily',
                prescribedBy: 'Dr. Sarah Wilson',
                startDate: '2024-01-15',
                status: 'active',
                instructions: 'Take with or without food. Monitor blood pressure regularly.',
                refillsLeft: 5
            },
            {
                id: 'med-2',
                name: 'Metformin',
                dosage: '500mg',
                frequency: 'Twice daily',
                prescribedBy: 'Dr. Michael Chen',
                startDate: '2023-12-01',
                status: 'active',
                instructions: 'Take with meals to reduce stomach upset.',
                refillsLeft: 2
            }
        ]
        setMedications(mockMedications)
    }

    const fetchBilling = async () => {
        const mockBilling: BillingRecord[] = [
            {
                id: 'bill-1',
                date: '2024-01-20',
                description: 'Annual Physical Examination',
                amount: 350.00,
                status: 'paid',
                insuranceCoverage: 280.00,
                patientResponsibility: 70.00
            },
            {
                id: 'bill-2',
                date: '2024-01-15',
                description: 'Cardiology Consultation',
                amount: 450.00,
                status: 'pending',
                dueDate: '2024-02-15',
                insuranceCoverage: 360.00,
                patientResponsibility: 90.00
            }
        ]
        setBilling(mockBilling)
    }

    const requestAppointment = async () => {
        try {
            // API call to request appointment
            toast.success('Appointment request submitted. You will receive confirmation within 24 hours.')
            setAppointmentRequest({
                preferredDate: '',
                preferredTime: '',
                department: '',
                reason: '',
                urgency: 'routine'
            })
        } catch (error) {
            toast.error('Failed to submit appointment request')
        }
    }

    const sendMessage = async () => {
        try {
            // API call to send message
            toast.success('Message sent to healthcare provider')
            setMessageToProvider({
                subject: '',
                message: '',
                department: ''
            })
        } catch (error) {
            toast.error('Failed to send message')
        }
    }

    const downloadLabResult = (resultId: string) => {
        // Simulate download
        toast.success('Lab result downloaded')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading patient portal...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card border-b">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={user?.avatar} alt={user?.name} />
                                <AvatarFallback className="text-xl">
                                    {user?.name?.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
                                <p className="text-muted-foreground">Patient ID: {user?.patientId || 'PAT001'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                                <WifiHighIcon className="w-3 h-3" />
                                Connected
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                                <LockIcon className="w-3 h-3" />
                                Secure
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-7">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="appointments">Appointments</TabsTrigger>
                        <TabsTrigger value="health-records">Health Records</TabsTrigger>
                        <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
                        <TabsTrigger value="medications">Medications</TabsTrigger>
                        <TabsTrigger value="billing">Billing</TabsTrigger>
                        <TabsTrigger value="messages">Messages</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="w-5 h-5 text-blue-500" />
                                        <div>
                                            <p className="text-2xl font-bold">
                                                {appointments.filter(a => a.status === 'scheduled').length}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <FileTextIcon className="w-5 h-5 text-green-500" />
                                        <div>
                                            <p className="text-2xl font-bold">
                                                {labResults.filter(l => l.status === 'completed').length}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Available Lab Results</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <PillIcon className="w-5 h-5 text-orange-500" />
                                        <div>
                                            <p className="text-2xl font-bold">
                                                {medications.filter(m => m.status === 'active').length}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Active Medications</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <CreditCardIcon className="w-5 h-5 text-red-500" />
                                        <div>
                                            <p className="text-2xl font-bold">
                                                {billing.filter(b => b.status === 'pending').length}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Pending Bills</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button 
                                        className="w-full justify-start" 
                                        variant="outline"
                                        onClick={() => setActiveTab('appointments')}
                                    >
                                        <CalendarIcon className="w-4 h-4 mr-2" />
                                        Schedule Appointment
                                    </Button>
                                    <Button 
                                        className="w-full justify-start" 
                                        variant="outline"
                                        onClick={() => setActiveTab('messages')}
                                    >
                                        <ChatCircleIcon className="w-4 h-4 mr-2" />
                                        Message Provider
                                    </Button>
                                    <Button 
                                        className="w-full justify-start" 
                                        variant="outline"
                                        onClick={() => setActiveTab('lab-results')}
                                    >
                                        <FileTextIcon className="w-4 h-4 mr-2" />
                                        View Lab Results
                                    </Button>
                                    <Button 
                                        className="w-full justify-start" 
                                        variant="outline"
                                        onClick={() => setActiveTab('medications')}
                                    >
                                        <PillIcon className="w-4 h-4 mr-2" />
                                        Request Prescription Refill
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Recent Activity */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {appointments.slice(0, 3).map((appointment) => (
                                            <div key={appointment.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted">
                                                <CalendarIcon className="w-4 h-4 text-blue-500" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{appointment.type}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                                                    </p>
                                                </div>
                                                <Badge variant={
                                                    appointment.status === 'scheduled' ? 'default' :
                                                    appointment.status === 'completed' ? 'secondary' : 'outline'
                                                }>
                                                    {appointment.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Appointments Tab */}
                    <TabsContent value="appointments" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Appointment List */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Your Appointments</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {appointments.map((appointment) => (
                                            <div key={appointment.id} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-semibold">{appointment.type}</h4>
                                                    <Badge variant={
                                                        appointment.status === 'scheduled' ? 'default' :
                                                        appointment.status === 'completed' ? 'secondary' :
                                                        appointment.status === 'cancelled' ? 'destructive' : 'outline'
                                                    }>
                                                        {appointment.status}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-1 text-sm">
                                                    <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
                                                    <p><strong>Time:</strong> {appointment.time}</p>
                                                    <p><strong>Doctor:</strong> {appointment.doctorName}</p>
                                                    <p><strong>Department:</strong> {appointment.department}</p>
                                                    <p><strong>Location:</strong> {appointment.location}</p>
                                                    {appointment.notes && (
                                                        <p><strong>Notes:</strong> {appointment.notes}</p>
                                                    )}
                                                </div>
                                                {appointment.status === 'scheduled' && (
                                                    <div className="mt-3 flex gap-2">
                                                        <Button size="sm" variant="outline">Reschedule</Button>
                                                        <Button size="sm" variant="outline">Cancel</Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Request Appointment */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Request New Appointment</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="preferred-date">Preferred Date</Label>
                                        <Input
                                            id="preferred-date"
                                            type="date"
                                            value={appointmentRequest.preferredDate}
                                            onChange={(e) => setAppointmentRequest(prev => ({
                                                ...prev,
                                                preferredDate: e.target.value
                                            }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="preferred-time">Preferred Time</Label>
                                        <select
                                            id="preferred-time"
                                            className="w-full p-2 border rounded-md"
                                            value={appointmentRequest.preferredTime}
                                            onChange={(e) => setAppointmentRequest(prev => ({
                                                ...prev,
                                                preferredTime: e.target.value
                                            }))}
                                        >
                                            <option value="">Select Time</option>
                                            <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
                                            <option value="afternoon">Afternoon (12:00 PM - 5:00 PM)</option>
                                            <option value="evening">Evening (5:00 PM - 8:00 PM)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department</Label>
                                        <select
                                            id="department"
                                            className="w-full p-2 border rounded-md"
                                            value={appointmentRequest.department}
                                            onChange={(e) => setAppointmentRequest(prev => ({
                                                ...prev,
                                                department: e.target.value
                                            }))}
                                        >
                                            <option value="">Select Department</option>
                                            <option value="cardiology">Cardiology</option>
                                            <option value="internal-medicine">Internal Medicine</option>
                                            <option value="orthopedics">Orthopedics</option>
                                            <option value="dermatology">Dermatology</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reason">Reason for Visit</Label>
                                        <Textarea
                                            id="reason"
                                            placeholder="Please describe your symptoms or reason for the appointment"
                                            value={appointmentRequest.reason}
                                            onChange={(e) => setAppointmentRequest(prev => ({
                                                ...prev,
                                                reason: e.target.value
                                            }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="urgency">Urgency</Label>
                                        <select
                                            id="urgency"
                                            className="w-full p-2 border rounded-md"
                                            value={appointmentRequest.urgency}
                                            onChange={(e) => setAppointmentRequest(prev => ({
                                                ...prev,
                                                urgency: e.target.value
                                            }))}
                                        >
                                            <option value="routine">Routine</option>
                                            <option value="urgent">Urgent</option>
                                            <option value="emergency">Emergency</option>
                                        </select>
                                    </div>
                                    <Button onClick={requestAppointment} className="w-full">
                                        Submit Request
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Lab Results Tab */}
                    <TabsContent value="lab-results" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Laboratory Results</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {labResults.map((result) => (
                                        <div key={result.id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h4 className="font-semibold text-lg">{result.testName}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Date: {new Date(result.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={
                                                        result.status === 'completed' ? 'default' :
                                                        result.status === 'pending' ? 'secondary' : 'outline'
                                                    }>
                                                        {result.status}
                                                    </Badge>
                                                    {result.status === 'completed' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => downloadLabResult(result.id)}
                                                        >
                                                            <DownloadIcon className="w-4 h-4 mr-2" />
                                                            Download
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {result.results && (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="border-b">
                                                                <th className="text-left p-2">Parameter</th>
                                                                <th className="text-left p-2">Value</th>
                                                                <th className="text-left p-2">Normal Range</th>
                                                                <th className="text-left p-2">Flag</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {result.results.map((item, index) => (
                                                                <tr key={index} className="border-b">
                                                                    <td className="p-2 font-medium">{item.parameter}</td>
                                                                    <td className="p-2">{item.value}</td>
                                                                    <td className="p-2 text-muted-foreground">{item.normalRange}</td>
                                                                    <td className="p-2">
                                                                        <Badge variant={
                                                                            item.flag === 'high' ? 'destructive' :
                                                                            item.flag === 'low' ? 'destructive' : 'secondary'
                                                                        }>
                                                                            {item.flag || 'normal'}
                                                                        </Badge>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                            
                                            {result.doctorNotes && (
                                                <div className="mt-4 p-3 bg-muted rounded-lg">
                                                    <h5 className="font-semibold mb-2">Doctor's Notes</h5>
                                                    <p className="text-sm">{result.doctorNotes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Medications Tab */}
                    <TabsContent value="medications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Current Medications</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {medications.map((medication) => (
                                        <div key={medication.id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h4 className="font-semibold text-lg">{medication.name}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {medication.dosage} - {medication.frequency}
                                                    </p>
                                                </div>
                                                <Badge variant={
                                                    medication.status === 'active' ? 'default' :
                                                    medication.status === 'completed' ? 'secondary' : 'outline'
                                                }>
                                                    {medication.status}
                                                </Badge>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                                                <div>
                                                    <p><strong>Prescribed by:</strong> {medication.prescribedBy}</p>
                                                    <p><strong>Start Date:</strong> {new Date(medication.startDate).toLocaleDateString()}</p>
                                                    {medication.endDate && (
                                                        <p><strong>End Date:</strong> {new Date(medication.endDate).toLocaleDateString()}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <p><strong>Refills Left:</strong> {medication.refillsLeft}</p>
                                                    <p><strong>Instructions:</strong> {medication.instructions}</p>
                                                </div>
                                            </div>
                                            
                                            {medication.status === 'active' && (
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline">
                                                        Request Refill
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        Set Reminder
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Messages Tab */}
                    <TabsContent value="messages" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Send Message to Healthcare Provider</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="message-subject">Subject</Label>
                                    <Input
                                        id="message-subject"
                                        placeholder="Enter subject"
                                        value={messageToProvider.subject}
                                        onChange={(e) => setMessageToProvider(prev => ({
                                            ...prev,
                                            subject: e.target.value
                                        }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message-department">Department</Label>
                                    <select
                                        id="message-department"
                                        className="w-full p-2 border rounded-md"
                                        value={messageToProvider.department}
                                        onChange={(e) => setMessageToProvider(prev => ({
                                            ...prev,
                                            department: e.target.value
                                        }))}
                                    >
                                        <option value="">Select Department</option>
                                        <option value="cardiology">Cardiology</option>
                                        <option value="internal-medicine">Internal Medicine</option>
                                        <option value="pharmacy">Pharmacy</option>
                                        <option value="billing">Billing</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message-content">Message</Label>
                                    <Textarea
                                        id="message-content"
                                        placeholder="Type your message here..."
                                        rows={5}
                                        value={messageToProvider.message}
                                        onChange={(e) => setMessageToProvider(prev => ({
                                            ...prev,
                                            message: e.target.value
                                        }))}
                                    />
                                </div>
                                <Button onClick={sendMessage} className="w-full">
                                    Send Message
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
