import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import {
    UserPlusIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckIcon,
    WarningIcon,
    ShieldIcon,
    CameraIcon,
    UploadIcon,
    UsersIcon,
    PhoneIcon,
    MapPinIcon,
    HeartIcon,
    SyringeIcon,
    FileTextIcon,
    IdentificationCardIcon
} from '@phosphor-icons/react'
import { usePatientApi } from '@/hooks/usePatientApi'
import {
    PatientCreateRequest,
    PatientDemographics,
    PatientInsurance,
    PatientAllergy,
    PatientMedication,
    PatientConsent,
    PatientCommunicationPreferences
} from '@/types/patient'

// Import step components
import ContactDemographicsStep from './steps/ContactDemographicsStep'
import InsuranceInformationStep from './steps/InsuranceInformationStep'
import MedicalHistoryStep from './steps/MedicalHistoryStep'
import ConsentsPortalStep from './steps/ConsentsPortalStep'

interface PatientRegistrationWizardProps {
    isEdit?: boolean
    patientId?: string
}

type WizardStep = 'basic' | 'contact' | 'insurance' | 'medical' | 'consents'

interface WizardData {
    basic: {
        name: string
        phone: string
        email: string
        date_of_birth: string
        gender: string
        address: string
        blood_group: string
        photo?: File
    }
    contact: PatientDemographics
    insurance: PatientInsurance[]
    medical: {
        allergies: PatientAllergy[]
        medications: PatientMedication[]
        chronic_conditions: string[]
        family_history: Array<{
            relationship: string
            condition: string
            age_at_diagnosis?: number
            current_status?: string
            notes?: string
        }>
    }
    consents: {
        consents: PatientConsent[]
        communicationPreferences: PatientCommunicationPreferences
        portalAccess: {
            createPortalAccess: boolean
            username: string
            email: string
            sendWelcomeEmail: boolean
        }
    }
}

export default function PatientRegistrationWizard({ isEdit = false, patientId }: PatientRegistrationWizardProps) {
    const navigate = useNavigate()
    const { createPatient, loading } = usePatientApi()

    const [currentStep, setCurrentStep] = useState<WizardStep>('basic')
    const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(new Set())
    const [duplicateCheck, setDuplicateCheck] = useState<{
        loading: boolean
        duplicates: any[]
        resolved: boolean
    }>({ loading: false, duplicates: [], resolved: false })

    const [wizardData, setWizardData] = useState<WizardData>({
        basic: {
            name: '',
            phone: '',
            email: '',
            date_of_birth: '',
            gender: '',
            address: '',
            blood_group: ''
        },
        contact: {
            id: '',
            patient_id: '',
            ethnicity: '',
            race: '',
            primary_language: 'English',
            secondary_language: '',
            marital_status: 'single',
            occupation: '',
            employer: '',
            education_level: 'high_school',
            religion: '',
            preferred_contact_method: 'phone',
            preferred_contact_time: '',
            emergency_contact_1: {
                name: '',
                relationship: '',
                phone: '',
                email: '',
                address: ''
            },
            emergency_contact_2: {
                name: '',
                relationship: '',
                phone: '',
                email: '',
                address: ''
            },
            next_of_kin: {
                name: '',
                relationship: '',
                phone: '',
                email: '',
                address: ''
            },
            created_at: '',
            updated_at: ''
        },
        insurance: [],
        medical: {
            allergies: [],
            medications: [],
            chronic_conditions: [],
            family_history: []
        },
        consents: {
            consents: [],
            communicationPreferences: {
                id: '',
                patient_id: '',
                appointment_reminders: true,
                appointment_reminder_method: 'sms',
                appointment_reminder_timing: 24,
                lab_results_notification: true,
                lab_results_method: 'portal',
                billing_notifications: true,
                billing_method: 'email',
                marketing_communications: false,
                health_tips: true,
                survey_participation: false,
                created_at: '',
                updated_at: ''
            },
            portalAccess: {
                createPortalAccess: true,
                username: '',
                email: '',
                sendWelcomeEmail: true
            }
        }
    })

    const steps: Array<{
        key: WizardStep
        title: string
        description: string
        icon: React.ReactNode
    }> = [
            {
                key: 'basic',
                title: 'Basic Information',
                description: 'Personal details and photo',
                icon: <UserPlusIcon className="w-5 h-5" />
            },
            {
                key: 'contact',
                title: 'Contact & Demographics',
                description: 'Address, emergency contacts, preferences',
                icon: <PhoneIcon className="w-5 h-5" />
            },
            {
                key: 'insurance',
                title: 'Insurance Information',
                description: 'Coverage details and verification',
                icon: <ShieldIcon className="w-5 h-5" />
            },
            {
                key: 'medical',
                title: 'Medical History',
                description: 'Allergies, medications, family history',
                icon: <HeartIcon className="w-5 h-5" />
            },
            {
                key: 'consents',
                title: 'Consents & Portal',
                description: 'Permissions and portal setup',
                icon: <FileTextIcon className="w-5 h-5" />
            }
        ]

    const getCurrentStepIndex = () => steps.findIndex(step => step.key === currentStep)
    const getProgress = () => ((getCurrentStepIndex() + 1) / steps.length) * 100

    // Duplicate checking function
    const checkForDuplicates = useCallback(async () => {
        if (!wizardData.basic.name || !wizardData.basic.phone) return

        setDuplicateCheck({ loading: true, duplicates: [], resolved: false })

        try {
            // Simulate API call for duplicate checking
            // In real implementation, this would call the API
            await new Promise(resolve => setTimeout(resolve, 1000))

            // For demo purposes, simulate finding duplicates if name contains "test"
            const foundDuplicates = wizardData.basic.name.toLowerCase().includes('test') ? [
                { id: '1', name: 'Test Patient', phone: '1234567890', similarity: 85 }
            ] : []

            setDuplicateCheck({
                loading: false,
                duplicates: foundDuplicates,
                resolved: foundDuplicates.length === 0
            })

            if (foundDuplicates.length > 0) {
                toast.warning(`Found ${foundDuplicates.length} potential duplicate(s)`)
            } else {
                toast.success('No duplicates found')
            }
        } catch (error) {
            setDuplicateCheck({ loading: false, duplicates: [], resolved: true })
            toast.error('Error checking for duplicates')
        }
    }, [wizardData.basic.name, wizardData.basic.phone])

    // Photo capture/upload
    const handlePhotoCapture = (file: File) => {
        setWizardData(prev => ({
            ...prev,
            basic: { ...prev.basic, photo: file }
        }))
        toast.success('Photo uploaded successfully')
    }

    // Navigation functions
    const nextStep = () => {
        const currentIndex = getCurrentStepIndex()
        if (currentIndex < steps.length - 1) {
            const nextStepKey = steps[currentIndex + 1].key
            setCurrentStep(nextStepKey)
            setCompletedSteps(prev => new Set([...prev, currentStep]))
        }
    }

    const prevStep = () => {
        const currentIndex = getCurrentStepIndex()
        if (currentIndex > 0) {
            const prevStepKey = steps[currentIndex - 1].key
            setCurrentStep(prevStepKey)
        }
    }

    const goToStep = (step: WizardStep) => {
        setCurrentStep(step)
    }

    // Validation functions
    const validateBasicInfo = () => {
        const { name, phone, date_of_birth, gender, address } = wizardData.basic

        if (!name.trim()) {
            toast.error('Name is required')
            return false
        }
        if (!phone.trim()) {
            toast.error('Phone number is required')
            return false
        }
        if (!date_of_birth) {
            toast.error('Date of birth is required')
            return false
        }
        if (!gender) {
            toast.error('Gender is required')
            return false
        }
        if (!address.trim()) {
            toast.error('Address is required')
            return false
        }

        return true
    }

    const validateContactInfo = () => {
        const { emergency_contact_1 } = wizardData.contact

        if (!emergency_contact_1?.name.trim()) {
            toast.error('Primary emergency contact name is required')
            return false
        }
        if (!emergency_contact_1?.phone.trim()) {
            toast.error('Primary emergency contact phone is required')
            return false
        }
        if (!emergency_contact_1?.relationship.trim()) {
            toast.error('Primary emergency contact relationship is required')
            return false
        }

        return true
    }

    // Handle step navigation with validation
    const handleNextStep = () => {
        let isValid = true

        switch (currentStep) {
            case 'basic':
                isValid = validateBasicInfo()
                if (isValid && !duplicateCheck.resolved) {
                    checkForDuplicates()
                    return
                }
                break
            case 'contact':
                isValid = validateContactInfo()
                break
            case 'insurance':
                // Insurance is optional, so no validation needed
                isValid = true
                break
            case 'medical':
                // Medical history is optional for new patients
                isValid = true
                break
            case 'consents':
                // Validate that required consents are granted
                const requiredConsents = wizardData.consents.consents.filter(c =>
                    c.consent_type === 'treatment'
                )
                if (requiredConsents.length === 0) {
                    toast.error('Treatment consent is required')
                    isValid = false
                }
                break
        }

        if (isValid) {
            nextStep()
        }
    }

    // Final submission
    const handleSubmit = async () => {
        try {
            // Convert wizard data to API format
            const patientData: PatientCreateRequest = {
                name: wizardData.basic.name,
                phone: wizardData.basic.phone,
                email: wizardData.basic.email,
                date_of_birth: wizardData.basic.date_of_birth,
                gender: wizardData.basic.gender,
                address: wizardData.basic.address,
                blood_group: wizardData.basic.blood_group,
                emergency_contact: wizardData.contact.emergency_contact_1!,
                allergies: wizardData.medical.allergies.map(a => a.allergen),
                chronic_conditions: wizardData.medical.chronic_conditions,
                vaccination_records: [], // Will be added separately
                insurance_info: wizardData.insurance[0] ? {
                    provider: wizardData.insurance[0].provider_name,
                    policy_number: wizardData.insurance[0].policy_number,
                    coverage_amount: 0, // Will be calculated from coverage_details
                    expiry_date: wizardData.insurance[0].expiry_date || '',
                    copay_amount: wizardData.insurance[0].copay_amount,
                    network_hospitals: []
                } : undefined
            }

            const patient = await createPatient(patientData)
            toast.success('Patient registered successfully!')

            // Navigate to patient profile
            navigate(`/patients/${patient.id}`)
        } catch (error) {
            console.error('Error creating patient:', error)
            toast.error('Failed to register patient')
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => navigate('/patients')}>
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back to Patients
                    </Button>
                    <div className="flex items-center gap-2">
                        <UserPlusIcon className="w-6 h-6 text-primary" />
                        <h1 className="text-2xl font-bold">
                            {isEdit ? 'Edit Patient' : 'Patient Registration Wizard'}
                        </h1>
                    </div>
                </div>

                <Badge variant="outline" className="text-sm">
                    Step {getCurrentStepIndex() + 1} of {steps.length}
                </Badge>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Registration Progress</span>
                    <span>{Math.round(getProgress())}% Complete</span>
                </div>
                <Progress value={getProgress()} className="h-2" />
            </div>

            {/* Step Navigation */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                        {steps.map((step, index) => (
                            <div key={step.key} className="flex items-center">
                                <button
                                    onClick={() => goToStep(step.key)}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${currentStep === step.key
                                            ? 'bg-primary text-primary-foreground'
                                            : completedSteps.has(step.key)
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {completedSteps.has(step.key) ? (
                                            <CheckIcon className="w-5 h-5" />
                                        ) : (
                                            step.icon
                                        )}
                                        <div className="text-left">
                                            <div className="font-medium">{step.title}</div>
                                            <div className="text-xs opacity-75">{step.description}</div>
                                        </div>
                                    </div>
                                </button>
                                {index < steps.length - 1 && (
                                    <ArrowRightIcon className="w-4 h-4 mx-2 text-muted-foreground" />
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Step Content */}
            <Card>
                <CardContent className="p-6">
                    {/* Basic Information Step */}
                    {currentStep === 'basic' && (
                        <BasicInformationStep
                            data={wizardData.basic}
                            onChange={(data) => setWizardData(prev => ({ ...prev, basic: data }))}
                            onPhotoCapture={handlePhotoCapture}
                            duplicateCheck={duplicateCheck}
                            onCheckDuplicates={checkForDuplicates}
                        />
                    )}

                    {/* Contact & Demographics Step */}
                    {currentStep === 'contact' && (
                        <ContactDemographicsStep
                            data={wizardData.contact}
                            onChange={(data) => setWizardData(prev => ({ ...prev, contact: data }))}
                        />
                    )}

                    {/* Insurance Information Step */}
                    {currentStep === 'insurance' && (
                        <InsuranceInformationStep
                            data={wizardData.insurance}
                            onChange={(data) => setWizardData(prev => ({ ...prev, insurance: data }))}
                        />
                    )}

                    {/* Medical History Step */}
                    {currentStep === 'medical' && (
                        <MedicalHistoryStep
                            data={wizardData.medical}
                            onChange={(data) => setWizardData(prev => ({ ...prev, medical: data }))}
                        />
                    )}

                    {/* Consents & Portal Step */}
                    {currentStep === 'consents' && (
                        <ConsentsPortalStep
                            data={wizardData.consents}
                            onChange={(data) => setWizardData(prev => ({ ...prev, consents: data }))}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={getCurrentStepIndex() === 0}
                >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Previous
                </Button>

                <div className="flex gap-2">
                    {getCurrentStepIndex() === steps.length - 1 ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Complete Registration'}
                        </Button>
                    ) : (
                        <Button onClick={handleNextStep}>
                            Next
                            <ArrowRightIcon className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

// BasicInformationStep Component
function BasicInformationStep({ data, onChange, onPhotoCapture, duplicateCheck, onCheckDuplicates }: any) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <UserPlusIcon className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Basic Information</h2>
            </div>

            {/* Photo capture section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Patient Photo</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                            {data.photo ? (
                                <img
                                    src={URL.createObjectURL(data.photo)}
                                    alt="Patient"
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                <CameraIcon className="w-8 h-8 text-muted-foreground" />
                            )}
                        </div>
                        <div className="space-y-2">
                            <Button variant="outline" onClick={() => document.getElementById('photo-upload')?.click()}>
                                <UploadIcon className="w-4 h-4 mr-2" />
                                Upload Photo
                            </Button>
                            <input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) onPhotoCapture(file)
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                Recommended: Clear headshot, good lighting
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => onChange({ ...data, name: e.target.value })}
                        placeholder="Enter full name"
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                        id="phone"
                        value={data.phone}
                        onChange={(e) => onChange({ ...data, phone: e.target.value })}
                        placeholder="Enter phone number"
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => onChange({ ...data, email: e.target.value })}
                        placeholder="Enter email address"
                    />
                </div>

                <div>
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <Input
                        id="dob"
                        type="date"
                        value={data.date_of_birth}
                        onChange={(e) => onChange({ ...data, date_of_birth: e.target.value })}
                        max={new Date().toISOString().split('T')[0]}
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={data.gender} onValueChange={(value) => onChange({ ...data, gender: value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
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
                    <Select value={data.blood_group} onValueChange={(value) => onChange({ ...data, blood_group: value })}>
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
                    value={data.address}
                    onChange={(e) => onChange({ ...data, address: e.target.value })}
                    placeholder="Enter complete address"
                    required
                />
            </div>

            {/* Duplicate Check */}
            {duplicateCheck.duplicates.length > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                    <CardHeader>
                        <CardTitle className="text-orange-800 flex items-center gap-2">
                            <WarningIcon className="w-5 h-5" />
                            Potential Duplicates Found
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-orange-700 mb-4">
                            We found {duplicateCheck.duplicates.length} patient(s) with similar information:
                        </p>
                        <div className="space-y-2">
                            {duplicateCheck.duplicates.map((duplicate, index) => (
                                <div key={index} className="p-3 bg-white rounded border">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{duplicate.name}</p>
                                            <p className="text-sm text-muted-foreground">{duplicate.phone}</p>
                                        </div>
                                        <Badge variant="outline">
                                            {duplicate.similarity}% Match
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex gap-2">
                            <Button variant="outline" size="sm">
                                Review Duplicates
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => duplicateCheck.resolved = true}
                            >
                                Continue Anyway
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
