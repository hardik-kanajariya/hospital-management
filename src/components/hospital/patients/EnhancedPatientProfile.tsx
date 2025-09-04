import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useNavigate, useParams } from 'react-router-dom'
import {
    UserIcon,
    ArrowLeftIcon,
    PencilIcon,
    PhoneIcon,
    MapPinIcon,
    CalendarIcon,
    HeartIcon,
    WarningIcon,
    PillIcon,
    SyringeIcon,
    UsersIcon,
    ShieldIcon,
    FileTextIcon,
    GlobeIcon,
    PrinterIcon,
    ShareIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@phosphor-icons/react'
import { usePatient } from '@/hooks/usePatientApi'
import { Patient } from '@/types/patient'

export default function EnhancedPatientProfile() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { patient, loading, error } = usePatient(id!)
    const [activeTab, setActiveTab] = useState('overview')

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading patient information...</p>
                </div>
            </div>
        )
    }

    if (error || !patient) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Patient Not Found</h2>
                    <p className="text-muted-foreground mb-4">
                        The patient you're looking for doesn't exist or you don't have permission to view it.
                    </p>
                    <Button onClick={() => navigate('/patients')}>
                        Back to Patients
                    </Button>
                </div>
            </div>
        )
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

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'mild': return 'bg-yellow-100 text-yellow-800'
            case 'moderate': return 'bg-orange-100 text-orange-800'
            case 'severe': return 'bg-red-100 text-red-800'
            case 'life-threatening': return 'bg-red-200 text-red-900'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800'
            case 'verified': return 'bg-green-100 text-green-800'
            case 'inactive': return 'bg-gray-100 text-gray-800'
            case 'discontinued': return 'bg-gray-100 text-gray-800'
            case 'failed': return 'bg-red-100 text-red-800'
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            default: return 'bg-gray-100 text-gray-800'
        }
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
                    <div className="flex items-center gap-2">
                        <UserIcon className="w-6 h-6 text-primary" />
                        <h1 className="text-2xl font-bold">Patient Profile</h1>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <PrinterIcon className="w-4 h-4 mr-2" />
                        Print
                    </Button>
                    <Button variant="outline" size="sm">
                        <ShareIcon className="w-4 h-4 mr-2" />
                        Share
                    </Button>
                    <Button size="sm" onClick={() => navigate(`/patients/${id}/edit`)}>
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                </div>
            </div>

            {/* Patient Header Card */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                        {/* Patient Photo */}
                        <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                            <UserIcon className="w-12 h-12 text-muted-foreground" />
                        </div>

                        {/* Patient Basic Info */}
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold">{patient.name}</h2>
                                <Badge variant="outline" className="text-sm">
                                    {patient.patient_id}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                    <span>{calculateAge(patient.date_of_birth)} years old</span>
                                    <span className="text-muted-foreground">
                                        ({new Date(patient.date_of_birth).toLocaleDateString()})
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <PhoneIcon className="w-4 h-4 text-muted-foreground" />
                                    <span>{patient.phone}</span>
                                </div>

                                {patient.blood_group && (
                                    <div className="flex items-center gap-2">
                                        <HeartIcon className="w-4 h-4 text-muted-foreground" />
                                        <span>{patient.blood_group}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-start gap-2">
                                <MapPinIcon className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <span className="text-sm">{patient.address}</span>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="text-right space-y-2">
                            <div className="text-sm text-muted-foreground">Member since</div>
                            <div className="font-medium">
                                {new Date(patient.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex flex-col gap-1">
                                {patient.patientAllergies && patient.patientAllergies.length > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                        {patient.patientAllergies.length} Allergies
                                    </Badge>
                                )}
                                {patient.medications && patient.medications.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                        {patient.medications.length} Medications
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="medical" className="flex items-center gap-2">
                        <HeartIcon className="w-4 h-4" />
                        Medical
                    </TabsTrigger>
                    <TabsTrigger value="allergies" className="flex items-center gap-2">
                        <WarningIcon className="w-4 h-4" />
                        Allergies
                    </TabsTrigger>
                    <TabsTrigger value="medications" className="flex items-center gap-2">
                        <PillIcon className="w-4 h-4" />
                        Medications
                    </TabsTrigger>
                    <TabsTrigger value="insurance" className="flex items-center gap-2">
                        <ShieldIcon className="w-4 h-4" />
                        Insurance
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="flex items-center gap-2">
                        <FileTextIcon className="w-4 h-4" />
                        Documents
                    </TabsTrigger>
                    <TabsTrigger value="portal" className="flex items-center gap-2">
                        <GlobeIcon className="w-4 h-4" />
                        Portal
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Demographics */}
                        {patient.demographics && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Demographics</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Gender:</span>
                                            <span className="ml-2 capitalize">{patient.gender}</span>
                                        </div>
                                        {patient.demographics.ethnicity && (
                                            <div>
                                                <span className="text-muted-foreground">Ethnicity:</span>
                                                <span className="ml-2">{patient.demographics.ethnicity}</span>
                                            </div>
                                        )}
                                        {patient.demographics.marital_status && (
                                            <div>
                                                <span className="text-muted-foreground">Marital Status:</span>
                                                <span className="ml-2 capitalize">{patient.demographics.marital_status}</span>
                                            </div>
                                        )}
                                        {patient.demographics.occupation && (
                                            <div>
                                                <span className="text-muted-foreground">Occupation:</span>
                                                <span className="ml-2">{patient.demographics.occupation}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Emergency Contacts */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Emergency Contacts</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-sm">Primary Contact</h4>
                                    <div className="mt-2 space-y-1 text-sm">
                                        <div>{patient.emergency_contact.name}</div>
                                        <div className="text-muted-foreground">
                                            {patient.emergency_contact.relationship} • {patient.emergency_contact.phone}
                                        </div>
                                    </div>
                                </div>

                                {patient.demographics?.emergency_contact_2?.name && (
                                    <div>
                                        <h4 className="font-medium text-sm">Secondary Contact</h4>
                                        <div className="mt-2 space-y-1 text-sm">
                                            <div>{patient.demographics.emergency_contact_2.name}</div>
                                            <div className="text-muted-foreground">
                                                {patient.demographics.emergency_contact_2.relationship} • {patient.demographics.emergency_contact_2.phone}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                    <CalendarIcon className="w-5 h-5 text-blue-500" />
                                    <div className="flex-1">
                                        <div className="font-medium">Patient registered</div>
                                        <div className="text-sm text-muted-foreground">
                                            {new Date(patient.created_at).toLocaleDateString()} • Registration completed
                                        </div>
                                    </div>
                                </div>

                                {/* Add more activity items based on appointments, visits, etc. */}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Medical History Tab */}
                <TabsContent value="medical" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Chronic Conditions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Chronic Conditions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {patient.chronic_conditions && patient.chronic_conditions.length > 0 ? (
                                    <div className="space-y-2">
                                        {patient.chronic_conditions.map((condition, index) => (
                                            <div key={index} className="p-2 bg-muted rounded">
                                                {condition}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">No chronic conditions recorded</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Family History */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Family History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {patient.familyHistory && patient.familyHistory.length > 0 ? (
                                    <div className="space-y-3">
                                        {patient.familyHistory.map((history, index) => (
                                            <div key={index} className="p-3 border rounded-lg">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-medium capitalize">{history.relationship}</div>
                                                        <div className="text-sm text-muted-foreground">{history.condition}</div>
                                                    </div>
                                                    <Badge variant="outline" className={getStatusColor(history.current_status || 'unknown')}>
                                                        {history.current_status || 'Unknown'}
                                                    </Badge>
                                                </div>
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

                {/* Allergies Tab */}
                <TabsContent value="allergies" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <WarningIcon className="w-5 h-5 text-orange-500" />
                                Known Allergies
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {patient.patientAllergies && patient.patientAllergies.length > 0 ? (
                                <div className="space-y-4">
                                    {patient.patientAllergies.map((allergy, index) => (
                                        <div key={index} className="p-4 border rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-medium">{allergy.allergen}</div>
                                                    <div className="text-sm text-muted-foreground capitalize">
                                                        {allergy.allergy_type} allergy
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Badge className={getSeverityColor(allergy.severity)}>
                                                        {allergy.severity}
                                                    </Badge>
                                                    <Badge className={getStatusColor(allergy.status)}>
                                                        {allergy.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                            {allergy.reaction_type && (
                                                <div className="text-sm">
                                                    <span className="text-muted-foreground">Reaction:</span>
                                                    <span className="ml-2">{allergy.reaction_type}</span>
                                                </div>
                                            )}
                                            {allergy.notes && (
                                                <div className="text-sm mt-2">
                                                    <span className="text-muted-foreground">Notes:</span>
                                                    <span className="ml-2">{allergy.notes}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <WarningIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No Known Allergies</h3>
                                    <p className="text-muted-foreground">No allergies have been recorded for this patient.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Medications Tab */}
                <TabsContent value="medications" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PillIcon className="w-5 h-5 text-blue-500" />
                                Current Medications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {patient.medications && patient.medications.length > 0 ? (
                                <div className="space-y-4">
                                    {patient.medications.map((medication, index) => (
                                        <div key={index} className="p-4 border rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-medium">{medication.medication_name}</div>
                                                    {medication.generic_name && (
                                                        <div className="text-sm text-muted-foreground">
                                                            Generic: {medication.generic_name}
                                                        </div>
                                                    )}
                                                </div>
                                                <Badge className={getStatusColor(medication.status)}>
                                                    {medication.status}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Dosage:</span>
                                                    <span className="ml-2">{medication.dosage}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Frequency:</span>
                                                    <span className="ml-2">{medication.frequency}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Route:</span>
                                                    <span className="ml-2 capitalize">{medication.route || 'Oral'}</span>
                                                </div>
                                            </div>
                                            {medication.reason && (
                                                <div className="text-sm mt-2">
                                                    <span className="text-muted-foreground">Reason:</span>
                                                    <span className="ml-2">{medication.reason}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <PillIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No Current Medications</h3>
                                    <p className="text-muted-foreground">No medications are currently recorded for this patient.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Insurance Tab */}
                <TabsContent value="insurance" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldIcon className="w-5 h-5 text-green-500" />
                                Insurance Coverage
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {patient.insurances && patient.insurances.length > 0 ? (
                                <div className="space-y-4">
                                    {patient.insurances.map((insurance, index) => (
                                        <div key={index} className="p-4 border rounded-lg">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <div className="font-medium">{insurance.provider_name}</div>
                                                    <div className="text-sm text-muted-foreground capitalize">
                                                        {insurance.insurance_type} Insurance
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Badge className={getStatusColor(insurance.verification_status)}>
                                                        {insurance.verification_status}
                                                    </Badge>
                                                    <Badge variant="outline" className={getStatusColor(insurance.status)}>
                                                        {insurance.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Policy Number:</span>
                                                    <span className="ml-2">{insurance.policy_number}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Subscriber:</span>
                                                    <span className="ml-2">{insurance.subscriber_name}</span>
                                                </div>
                                                {insurance.copay_amount && (
                                                    <div>
                                                        <span className="text-muted-foreground">Copay:</span>
                                                        <span className="ml-2">${insurance.copay_amount}</span>
                                                    </div>
                                                )}
                                                {insurance.deductible_amount && (
                                                    <div>
                                                        <span className="text-muted-foreground">Deductible:</span>
                                                        <span className="ml-2">${insurance.deductible_amount}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <ShieldIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No Insurance Information</h3>
                                    <p className="text-muted-foreground">No insurance plans are recorded for this patient.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileTextIcon className="w-5 h-5 text-purple-500" />
                                Patient Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <FileTextIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">No Documents</h3>
                                <p className="text-muted-foreground">No documents have been uploaded for this patient.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Portal Tab */}
                <TabsContent value="portal" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GlobeIcon className="w-5 h-5 text-indigo-500" />
                                Patient Portal Access
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {patient.portalAccess ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <div className="font-medium">Portal Account</div>
                                            <div className="text-sm text-muted-foreground">
                                                Username: {patient.portalAccess.username}
                                            </div>
                                        </div>
                                        <Badge className={getStatusColor(patient.portalAccess.is_active ? 'active' : 'inactive')}>
                                            {patient.portalAccess.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    {patient.portalAccess.last_login && (
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">Last Login:</span>
                                            <span className="ml-2">
                                                {new Date(patient.portalAccess.last_login).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <GlobeIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No Portal Access</h3>
                                    <p className="text-muted-foreground">Patient portal access has not been set up.</p>
                                    <Button className="mt-4" variant="outline">
                                        Set Up Portal Access
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
