import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
    FileTextIcon,
    ShieldCheckIcon,
    UserIcon,
    PhoneIcon,
    BellIcon,
    EyeIcon,
    GlobeIcon,
    CheckCircleIcon,
    XCircleIcon,
    WarningIcon
} from '@phosphor-icons/react'
import { PatientConsent, PatientCommunicationPreferences } from '@/types/patient'

interface ConsentsPortalData {
    consents: PatientConsent[]
    communicationPreferences: PatientCommunicationPreferences
    portalAccess: {
        createPortalAccess: boolean
        username: string
        email: string
        sendWelcomeEmail: boolean
    }
}

interface ConsentsPortalStepProps {
    data: ConsentsPortalData
    onChange: (data: ConsentsPortalData) => void
}

const CONSENT_FORMS = [
    {
        type: 'treatment' as const,
        title: 'Treatment Consent',
        description: 'Consent for medical treatment and procedures',
        required: true,
        content: 'I consent to receive medical treatment from the healthcare providers at this facility. I understand the nature of the treatment and any associated risks.'
    },
    {
        type: 'data-sharing' as const,
        title: 'Data Sharing Consent',
        description: 'Consent for sharing medical information with other healthcare providers',
        required: false,
        content: 'I consent to the sharing of my medical information with other healthcare providers for the purpose of coordinated care.'
    },
    {
        type: 'research' as const,
        title: 'Research Participation',
        description: 'Consent for participation in medical research studies',
        required: false,
        content: 'I consent to participate in medical research studies that may be conducted at this facility. I understand that participation is voluntary.'
    },
    {
        type: 'photography' as const,
        title: 'Photography & Recording',
        description: 'Consent for medical photography and recording for treatment purposes',
        required: false,
        content: 'I consent to medical photography and recording for treatment, education, and quality improvement purposes.'
    },
    {
        type: 'marketing' as const,
        title: 'Marketing Communications',
        description: 'Consent to receive marketing communications and health promotion materials',
        required: false,
        content: 'I consent to receive marketing communications, health tips, and promotional materials from this healthcare facility.'
    }
]

export default function ConsentsPortalStep({ data, onChange }: ConsentsPortalStepProps) {
    const [signatureMode, setSignatureMode] = useState<'digital' | 'upload'>('digital')
    const [digitalSignature, setDigitalSignature] = useState('')

    const updateConsent = (consentType: string, granted: boolean) => {
        const existingConsent = data.consents.find(c => c.consent_type === consentType)

        if (granted && !existingConsent) {
            // Add new consent
            const newConsent: PatientConsent = {
                id: `temp-${Date.now()}`,
                patient_id: '',
                consent_type: consentType as any,
                consent_form_id: `form-${consentType}`,
                status: 'granted',
                granted_date: new Date().toISOString(),
                patient_signature: digitalSignature || 'Digital Signature Pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }

            onChange({
                ...data,
                consents: [...data.consents, newConsent]
            })
        } else if (!granted && existingConsent) {
            // Remove consent
            onChange({
                ...data,
                consents: data.consents.filter(c => c.consent_type !== consentType)
            })
        }
    }

    const updateCommunicationPreferences = (field: keyof PatientCommunicationPreferences, value: any) => {
        onChange({
            ...data,
            communicationPreferences: {
                ...data.communicationPreferences,
                [field]: value
            }
        })
    }

    const updatePortalAccess = (field: keyof typeof data.portalAccess, value: any) => {
        onChange({
            ...data,
            portalAccess: {
                ...data.portalAccess,
                [field]: value
            }
        })
    }

    const isConsentGranted = (consentType: string) => {
        return data.consents.some(c => c.consent_type === consentType && c.status === 'granted')
    }

    const generateUsername = () => {
        const patientName = 'patient' // In real implementation, get from patient data
        const timestamp = Date.now().toString().slice(-4)
        const username = `${patientName}${timestamp}`.toLowerCase()
        updatePortalAccess('username', username)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <FileTextIcon className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Consents & Portal Setup</h2>
            </div>

            {/* Digital Signature Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <EyeIcon className="w-4 h-4" />
                        Digital Signature
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Please provide your digital signature to sign consent forms.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="digital_signature">Type Your Full Name</Label>
                            <Input
                                id="digital_signature"
                                value={digitalSignature}
                                onChange={(e) => setDigitalSignature(e.target.value)}
                                placeholder="Enter your full legal name"
                                className="font-cursive text-lg"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                By typing your name, you agree that this constitutes your legal digital signature.
                            </p>
                        </div>

                        {digitalSignature && (
                            <div className="p-4 border rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground mb-2">Preview of your signature:</p>
                                <div className="text-2xl font-cursive text-primary border-b border-primary/20 pb-2 inline-block">
                                    {digitalSignature}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Consent Forms */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileTextIcon className="w-4 h-4" />
                        Consent Forms
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {CONSENT_FORMS.map((form) => (
                        <div key={form.type} className="space-y-3">
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id={`consent-${form.type}`}
                                    checked={isConsentGranted(form.type)}
                                    onCheckedChange={(checked) => updateConsent(form.type, checked as boolean)}
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <Label
                                            htmlFor={`consent-${form.type}`}
                                            className="text-base font-medium cursor-pointer"
                                        >
                                            {form.title}
                                        </Label>
                                        {form.required && (
                                            <Badge variant="destructive" className="text-xs">Required</Badge>
                                        )}
                                        {isConsentGranted(form.type) && (
                                            <CheckCircleIcon className="w-4 h-4 text-green-600" />
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{form.description}</p>

                                    <details className="mt-2">
                                        <summary className="text-sm text-primary cursor-pointer hover:underline">
                                            Read full consent text
                                        </summary>
                                        <div className="mt-2 p-3 bg-muted/50 rounded text-sm">
                                            {form.content}
                                        </div>
                                    </details>
                                </div>
                            </div>

                            {form.required && !isConsentGranted(form.type) && (
                                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded">
                                    <WarningIcon className="w-4 h-4" />
                                    <span className="text-sm">This consent is required to proceed</span>
                                </div>
                            )}

                            <Separator />
                        </div>
                    ))}

                    {!digitalSignature && data.consents.length > 0 && (
                        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                            <div className="flex items-center gap-2 text-orange-800">
                                <WarningIcon className="w-4 h-4" />
                                <span className="font-medium">Digital signature required</span>
                            </div>
                            <p className="text-sm text-orange-700 mt-1">
                                Please provide your digital signature above to validate your consents.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Communication Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BellIcon className="w-4 h-4" />
                        Communication Preferences
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Appointment Reminders */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="appointment_reminders"
                                checked={data.communicationPreferences.appointment_reminders}
                                onCheckedChange={(checked) => updateCommunicationPreferences('appointment_reminders', checked)}
                            />
                            <Label htmlFor="appointment_reminders" className="font-medium">
                                Appointment Reminders
                            </Label>
                        </div>

                        {data.communicationPreferences.appointment_reminders && (
                            <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="reminder_method">Reminder Method</Label>
                                    <Select
                                        value={data.communicationPreferences.appointment_reminder_method}
                                        onValueChange={(value) => updateCommunicationPreferences('appointment_reminder_method', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sms">SMS/Text</SelectItem>
                                            <SelectItem value="email">Email</SelectItem>
                                            <SelectItem value="call">Phone Call</SelectItem>
                                            <SelectItem value="all">All Methods</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="reminder_timing">Reminder Timing</Label>
                                    <Select
                                        value={data.communicationPreferences.appointment_reminder_timing.toString()}
                                        onValueChange={(value) => updateCommunicationPreferences('appointment_reminder_timing', parseInt(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select timing" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="24">24 hours before</SelectItem>
                                            <SelectItem value="48">48 hours before</SelectItem>
                                            <SelectItem value="72">3 days before</SelectItem>
                                            <SelectItem value="168">1 week before</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Lab Results */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="lab_results"
                                checked={data.communicationPreferences.lab_results_notification}
                                onCheckedChange={(checked) => updateCommunicationPreferences('lab_results_notification', checked)}
                            />
                            <Label htmlFor="lab_results" className="font-medium">
                                Lab Results Notifications
                            </Label>
                        </div>

                        {data.communicationPreferences.lab_results_notification && (
                            <div className="ml-6">
                                <Label htmlFor="lab_method">Notification Method</Label>
                                <Select
                                    value={data.communicationPreferences.lab_results_method}
                                    onValueChange={(value) => updateCommunicationPreferences('lab_results_method', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="portal">Patient Portal</SelectItem>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="sms">SMS/Text</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Billing Notifications */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="billing_notifications"
                                checked={data.communicationPreferences.billing_notifications}
                                onCheckedChange={(checked) => updateCommunicationPreferences('billing_notifications', checked)}
                            />
                            <Label htmlFor="billing_notifications" className="font-medium">
                                Billing Notifications
                            </Label>
                        </div>

                        {data.communicationPreferences.billing_notifications && (
                            <div className="ml-6">
                                <Label htmlFor="billing_method">Billing Method</Label>
                                <Select
                                    value={data.communicationPreferences.billing_method}
                                    onValueChange={(value) => updateCommunicationPreferences('billing_method', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="email">Email Only</SelectItem>
                                        <SelectItem value="paper">Paper Mail</SelectItem>
                                        <SelectItem value="both">Both Email & Paper</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Other Preferences */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="marketing_communications"
                                checked={data.communicationPreferences.marketing_communications}
                                onCheckedChange={(checked) => updateCommunicationPreferences('marketing_communications', checked)}
                            />
                            <Label htmlFor="marketing_communications">
                                Marketing Communications & Health Promotions
                            </Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="health_tips"
                                checked={data.communicationPreferences.health_tips}
                                onCheckedChange={(checked) => updateCommunicationPreferences('health_tips', checked)}
                            />
                            <Label htmlFor="health_tips">
                                Health Tips & Educational Content
                            </Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="survey_participation"
                                checked={data.communicationPreferences.survey_participation}
                                onCheckedChange={(checked) => updateCommunicationPreferences('survey_participation', checked)}
                            />
                            <Label htmlFor="survey_participation">
                                Patient Satisfaction Surveys
                            </Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Patient Portal Setup */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GlobeIcon className="w-4 h-4" />
                        Patient Portal Access
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="create_portal"
                            checked={data.portalAccess.createPortalAccess}
                            onCheckedChange={(checked) => updatePortalAccess('createPortalAccess', checked)}
                        />
                        <Label htmlFor="create_portal" className="font-medium">
                            Create Patient Portal Account
                        </Label>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        The patient portal allows you to view lab results, book appointments,
                        communicate with providers, and manage your health information online.
                    </p>

                    {data.portalAccess.createPortalAccess && (
                        <div className="space-y-4 ml-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="portal_username">Username</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="portal_username"
                                            value={data.portalAccess.username}
                                            onChange={(e) => updatePortalAccess('username', e.target.value)}
                                            placeholder="Choose username"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={generateUsername}
                                        >
                                            Generate
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="portal_email">Email Address</Label>
                                    <Input
                                        id="portal_email"
                                        type="email"
                                        value={data.portalAccess.email}
                                        onChange={(e) => updatePortalAccess('email', e.target.value)}
                                        placeholder="Enter email for portal access"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="send_welcome"
                                    checked={data.portalAccess.sendWelcomeEmail}
                                    onCheckedChange={(checked) => updatePortalAccess('sendWelcomeEmail', checked)}
                                />
                                <Label htmlFor="send_welcome">
                                    Send welcome email with portal access instructions
                                </Label>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                <div className="flex items-center gap-2 text-blue-800">
                                    <ShieldCheckIcon className="w-4 h-4" />
                                    <span className="font-medium">Portal Security</span>
                                </div>
                                <p className="text-sm text-blue-700 mt-1">
                                    A temporary password will be generated and sent to your email.
                                    You'll be required to change it on first login for security.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Summary */}
            <Card className="bg-green-50 border-green-200">
                <CardHeader>
                    <CardTitle className="text-green-900">Registration Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-green-600" />
                            <span>Consents granted: {data.consents.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-green-600" />
                            <span>Communication preferences configured</span>
                        </div>
                        {data.portalAccess.createPortalAccess && (
                            <div className="flex items-center gap-2">
                                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                                <span>Patient portal account will be created</span>
                            </div>
                        )}
                    </div>

                    <p className="text-sm text-green-700 mt-4">
                        Your registration is complete! Click "Complete Registration" to finalize your patient profile.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
