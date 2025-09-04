import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    UsersIcon,
    PhoneIcon,
    MapPinIcon,
    GlobeIcon,
    BriefcaseIcon,
    HeartIcon,
    PlusIcon,
    TrashIcon
} from '@phosphor-icons/react'
import { PatientDemographics } from '@/types/patient'

interface ContactDemographicsStepProps {
    data: PatientDemographics
    onChange: (data: PatientDemographics) => void
}

export default function ContactDemographicsStep({ data, onChange }: ContactDemographicsStepProps) {
    const updateField = (field: keyof PatientDemographics, value: any) => {
        onChange({ ...data, [field]: value })
    }

    const updateEmergencyContact = (contactType: 'emergency_contact_1' | 'emergency_contact_2' | 'next_of_kin', field: string, value: string) => {
        const contact = data[contactType] || { name: '', relationship: '', phone: '', email: '', address: '' }
        onChange({
            ...data,
            [contactType]: { ...contact, [field]: value }
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <PhoneIcon className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Contact & Demographics</h2>
            </div>

            {/* Demographics Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GlobeIcon className="w-4 h-4" />
                        Demographics & Cultural Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="ethnicity">Ethnicity</Label>
                            <Input
                                id="ethnicity"
                                value={data.ethnicity || ''}
                                onChange={(e) => updateField('ethnicity', e.target.value)}
                                placeholder="Enter ethnicity"
                            />
                        </div>

                        <div>
                            <Label htmlFor="race">Race</Label>
                            <Input
                                id="race"
                                value={data.race || ''}
                                onChange={(e) => updateField('race', e.target.value)}
                                placeholder="Enter race"
                            />
                        </div>

                        <div>
                            <Label htmlFor="primary_language">Primary Language</Label>
                            <Select 
                                value={data.primary_language || 'English'} 
                                onValueChange={(value) => updateField('primary_language', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select primary language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="English">English</SelectItem>
                                    <SelectItem value="Hindi">Hindi</SelectItem>
                                    <SelectItem value="Spanish">Spanish</SelectItem>
                                    <SelectItem value="French">French</SelectItem>
                                    <SelectItem value="German">German</SelectItem>
                                    <SelectItem value="Chinese">Chinese</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="secondary_language">Secondary Language</Label>
                            <Select 
                                value={data.secondary_language || ''} 
                                onValueChange={(value) => updateField('secondary_language', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select secondary language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">None</SelectItem>
                                    <SelectItem value="English">English</SelectItem>
                                    <SelectItem value="Hindi">Hindi</SelectItem>
                                    <SelectItem value="Spanish">Spanish</SelectItem>
                                    <SelectItem value="French">French</SelectItem>
                                    <SelectItem value="German">German</SelectItem>
                                    <SelectItem value="Chinese">Chinese</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="marital_status">Marital Status</Label>
                            <Select 
                                value={data.marital_status || 'single'} 
                                onValueChange={(value) => updateField('marital_status', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select marital status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="single">Single</SelectItem>
                                    <SelectItem value="married">Married</SelectItem>
                                    <SelectItem value="divorced">Divorced</SelectItem>
                                    <SelectItem value="widowed">Widowed</SelectItem>
                                    <SelectItem value="separated">Separated</SelectItem>
                                    <SelectItem value="domestic_partnership">Domestic Partnership</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="religion">Religion</Label>
                            <Input
                                id="religion"
                                value={data.religion || ''}
                                onChange={(e) => updateField('religion', e.target.value)}
                                placeholder="Enter religion (optional)"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BriefcaseIcon className="w-4 h-4" />
                        Professional & Educational Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="occupation">Occupation</Label>
                            <Input
                                id="occupation"
                                value={data.occupation || ''}
                                onChange={(e) => updateField('occupation', e.target.value)}
                                placeholder="Enter occupation"
                            />
                        </div>

                        <div>
                            <Label htmlFor="employer">Employer</Label>
                            <Input
                                id="employer"
                                value={data.employer || ''}
                                onChange={(e) => updateField('employer', e.target.value)}
                                placeholder="Enter employer name"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="education_level">Education Level</Label>
                            <Select 
                                value={data.education_level || 'high_school'} 
                                onValueChange={(value) => updateField('education_level', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select education level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No formal education</SelectItem>
                                    <SelectItem value="elementary">Elementary</SelectItem>
                                    <SelectItem value="high_school">High School</SelectItem>
                                    <SelectItem value="some_college">Some College</SelectItem>
                                    <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                                    <SelectItem value="master">Master's Degree</SelectItem>
                                    <SelectItem value="doctorate">Doctorate</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Communication Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PhoneIcon className="w-4 h-4" />
                        Communication Preferences
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="preferred_contact_method">Preferred Contact Method</Label>
                            <Select 
                                value={data.preferred_contact_method || 'phone'} 
                                onValueChange={(value) => updateField('preferred_contact_method', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select contact method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="phone">Phone</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="sms">SMS/Text</SelectItem>
                                    <SelectItem value="mail">Mail</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="preferred_contact_time">Preferred Contact Time</Label>
                            <Select 
                                value={data.preferred_contact_time || ''} 
                                onValueChange={(value) => updateField('preferred_contact_time', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select preferred time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="morning">Morning (8 AM - 12 PM)</SelectItem>
                                    <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                                    <SelectItem value="evening">Evening (5 PM - 8 PM)</SelectItem>
                                    <SelectItem value="anytime">Anytime</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Emergency Contact 1 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UsersIcon className="w-4 h-4" />
                        Primary Emergency Contact *
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="ec1_name">Full Name *</Label>
                            <Input
                                id="ec1_name"
                                value={data.emergency_contact_1?.name || ''}
                                onChange={(e) => updateEmergencyContact('emergency_contact_1', 'name', e.target.value)}
                                placeholder="Enter full name"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="ec1_relationship">Relationship *</Label>
                            <Select 
                                value={data.emergency_contact_1?.relationship || ''} 
                                onValueChange={(value) => updateEmergencyContact('emergency_contact_1', 'relationship', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select relationship" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="spouse">Spouse</SelectItem>
                                    <SelectItem value="parent">Parent</SelectItem>
                                    <SelectItem value="child">Child</SelectItem>
                                    <SelectItem value="sibling">Sibling</SelectItem>
                                    <SelectItem value="friend">Friend</SelectItem>
                                    <SelectItem value="neighbor">Neighbor</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="ec1_phone">Phone Number *</Label>
                            <Input
                                id="ec1_phone"
                                value={data.emergency_contact_1?.phone || ''}
                                onChange={(e) => updateEmergencyContact('emergency_contact_1', 'phone', e.target.value)}
                                placeholder="Enter phone number"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="ec1_email">Email Address</Label>
                            <Input
                                id="ec1_email"
                                type="email"
                                value={data.emergency_contact_1?.email || ''}
                                onChange={(e) => updateEmergencyContact('emergency_contact_1', 'email', e.target.value)}
                                placeholder="Enter email address"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="ec1_address">Address</Label>
                            <Textarea
                                id="ec1_address"
                                value={data.emergency_contact_1?.address || ''}
                                onChange={(e) => updateEmergencyContact('emergency_contact_1', 'address', e.target.value)}
                                placeholder="Enter address"
                                rows={2}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Emergency Contact 2 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UsersIcon className="w-4 h-4" />
                        Secondary Emergency Contact (Optional)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="ec2_name">Full Name</Label>
                            <Input
                                id="ec2_name"
                                value={data.emergency_contact_2?.name || ''}
                                onChange={(e) => updateEmergencyContact('emergency_contact_2', 'name', e.target.value)}
                                placeholder="Enter full name"
                            />
                        </div>

                        <div>
                            <Label htmlFor="ec2_relationship">Relationship</Label>
                            <Select 
                                value={data.emergency_contact_2?.relationship || ''} 
                                onValueChange={(value) => updateEmergencyContact('emergency_contact_2', 'relationship', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select relationship" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">None</SelectItem>
                                    <SelectItem value="spouse">Spouse</SelectItem>
                                    <SelectItem value="parent">Parent</SelectItem>
                                    <SelectItem value="child">Child</SelectItem>
                                    <SelectItem value="sibling">Sibling</SelectItem>
                                    <SelectItem value="friend">Friend</SelectItem>
                                    <SelectItem value="neighbor">Neighbor</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="ec2_phone">Phone Number</Label>
                            <Input
                                id="ec2_phone"
                                value={data.emergency_contact_2?.phone || ''}
                                onChange={(e) => updateEmergencyContact('emergency_contact_2', 'phone', e.target.value)}
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div>
                            <Label htmlFor="ec2_email">Email Address</Label>
                            <Input
                                id="ec2_email"
                                type="email"
                                value={data.emergency_contact_2?.email || ''}
                                onChange={(e) => updateEmergencyContact('emergency_contact_2', 'email', e.target.value)}
                                placeholder="Enter email address"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="ec2_address">Address</Label>
                            <Textarea
                                id="ec2_address"
                                value={data.emergency_contact_2?.address || ''}
                                onChange={(e) => updateEmergencyContact('emergency_contact_2', 'address', e.target.value)}
                                placeholder="Enter address"
                                rows={2}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Next of Kin */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeartIcon className="w-4 h-4" />
                        Next of Kin (Optional)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Person to be notified in case of serious medical decisions or emergencies
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="nok_name">Full Name</Label>
                            <Input
                                id="nok_name"
                                value={data.next_of_kin?.name || ''}
                                onChange={(e) => updateEmergencyContact('next_of_kin', 'name', e.target.value)}
                                placeholder="Enter full name"
                            />
                        </div>

                        <div>
                            <Label htmlFor="nok_relationship">Relationship</Label>
                            <Select 
                                value={data.next_of_kin?.relationship || ''} 
                                onValueChange={(value) => updateEmergencyContact('next_of_kin', 'relationship', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select relationship" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">None</SelectItem>
                                    <SelectItem value="spouse">Spouse</SelectItem>
                                    <SelectItem value="parent">Parent</SelectItem>
                                    <SelectItem value="child">Child</SelectItem>
                                    <SelectItem value="sibling">Sibling</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="nok_phone">Phone Number</Label>
                            <Input
                                id="nok_phone"
                                value={data.next_of_kin?.phone || ''}
                                onChange={(e) => updateEmergencyContact('next_of_kin', 'phone', e.target.value)}
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div>
                            <Label htmlFor="nok_email">Email Address</Label>
                            <Input
                                id="nok_email"
                                type="email"
                                value={data.next_of_kin?.email || ''}
                                onChange={(e) => updateEmergencyContact('next_of_kin', 'email', e.target.value)}
                                placeholder="Enter email address"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="nok_address">Address</Label>
                            <Textarea
                                id="nok_address"
                                value={data.next_of_kin?.address || ''}
                                onChange={(e) => updateEmergencyContact('next_of_kin', 'address', e.target.value)}
                                placeholder="Enter address"
                                rows={2}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
