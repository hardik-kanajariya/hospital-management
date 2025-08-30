import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import {
    UserPlusIcon,
    ArrowLeftIcon,
    PlusIcon,
    TrashIcon,
    FloppyDiskIcon,
    SyringeIcon,
    ShieldIcon,
    WarningIcon,
    HeartIcon
} from '@phosphor-icons/react'
import { usePatientApi } from '@/hooks/usePatientApi'
import { PatientCreateRequest, VaccinationRecord } from '@/types/patient';

export default function CreatePatient() {
    const navigate = useNavigate()
    const { createPatient, loading } = usePatientApi()

    const [formData, setFormData] = useState<PatientCreateRequest>({
        name: '',
        phone: '',
        email: '',
        date_of_birth: '',
        gender: 'male',
        address: '',
        emergency_contact: {
            name: '',
            relationship: '',
            phone: '',
            email: '',
            address: ''
        },
        blood_group: '',
        allergies: [],
        chronic_conditions: [],
        vaccination_records: [],
        insurance_info: undefined
    })

    const [activeTab, setActiveTab] = useState('basic')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            // Validate required fields
            if (!formData.name.trim()) {
                toast.error('Name is required')
                return
            }
            if (!formData.phone.trim()) {
                toast.error('Phone number is required')
                return
            }
            if (!formData.date_of_birth) {
                toast.error('Date of birth is required')
                return
            }
            if (!formData.address.trim()) {
                toast.error('Address is required')
                return
            }
            // Emergency contact is optional for Indian village hospitals
            // No validation required for emergency contact fields

            const patient = await createPatient(formData)
            toast.success('Patient created successfully')
            navigate(`/patients/${patient.id}`)
        } catch (error) {
            console.error('Error creating patient:', error)
            // Error is already handled in the hook
        }
    }

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
            navigate('/patients')
        }
    }

    // Allergy management
    const addAllergy = () => {
        setFormData(prev => ({
            ...prev,
            allergies: [...(prev.allergies || []), '']
        }))
    }

    const updateAllergy = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            allergies: prev.allergies?.map((allergy, i) => i === index ? value : allergy) || []
        }))
    }

    const removeAllergy = (index: number) => {
        setFormData(prev => ({
            ...prev,
            allergies: prev.allergies?.filter((_, i) => i !== index) || []
        }))
    }

    // Chronic condition management
    const addChronicCondition = () => {
        setFormData(prev => ({
            ...prev,
            chronic_conditions: [...(prev.chronic_conditions || []), '']
        }))
    }

    const updateChronicCondition = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            chronic_conditions: prev.chronic_conditions?.map((condition, i) => i === index ? value : condition) || []
        }))
    }

    const removeChronicCondition = (index: number) => {
        setFormData(prev => ({
            ...prev,
            chronic_conditions: prev.chronic_conditions?.filter((_, i) => i !== index) || []
        }))
    }

    // Vaccination management
    const addVaccination = () => {
        setFormData(prev => ({
            ...prev,
            vaccination_records: [...(prev.vaccination_records || []), {
                vaccine_name: '',
                date_administered: '',
                next_due_date: '',
                administered_by: '',
                batch_number: '',
                notes: ''
            }]
        }))
    }

    const updateVaccination = (index: number, field: keyof VaccinationRecord, value: string) => {
        setFormData(prev => ({
            ...prev,
            vaccination_records: prev.vaccination_records?.map((vaccination, i) =>
                i === index ? { ...vaccination, [field]: value } : vaccination
            ) || []
        }))
    }

    const removeVaccination = (index: number) => {
        setFormData(prev => ({
            ...prev,
            vaccination_records: prev.vaccination_records?.filter((_, i) => i !== index) || []
        }))
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => navigate('/patients')}>
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Patients
                </Button>
                <div className="flex items-center gap-2">
                    <UserPlusIcon className="w-6 h-6 text-primary" />
                    <h1 className="text-2xl font-bold">Add New Patient</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Patient Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                <TabsTrigger value="medical">Medical Info</TabsTrigger>
                                <TabsTrigger value="vaccination">Vaccinations</TabsTrigger>
                                <TabsTrigger value="insurance">Insurance</TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic" className="space-y-6 mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Personal Information</h3>

                                        <div>
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="Enter full name"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="phone">Phone Number *</Label>
                                                <Input
                                                    id="phone"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                    placeholder="Enter phone number"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={formData.email || ''}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                    placeholder="Enter email address"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="dob">Date of Birth *</Label>
                                                <Input
                                                    id="dob"
                                                    type="date"
                                                    value={formData.date_of_birth}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="gender">Gender *</Label>
                                                <Select
                                                    value={formData.gender}
                                                    onValueChange={(value: 'male' | 'female' | 'other') =>
                                                        setFormData(prev => ({ ...prev, gender: value }))
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="female">Female</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="blood_group">Blood Group</Label>
                                            <Select
                                                value={formData.blood_group || 'not_specified'}
                                                onValueChange={(value) => setFormData(prev => ({
                                                    ...prev,
                                                    blood_group: value === 'not_specified' ? '' : value
                                                }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select blood group" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="not_specified">Not specified</SelectItem>
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

                                        <div>
                                            <Label htmlFor="address">Address *</Label>
                                            <Textarea
                                                id="address"
                                                value={formData.address}
                                                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                                placeholder="Enter complete address"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Emergency Contact (Optional)</h3>
                                        <p className="text-sm text-muted-foreground">Emergency contact information is optional but recommended</p>

                                        <div>
                                            <Label htmlFor="emergency_name">Name</Label>
                                            <Input
                                                id="emergency_name"
                                                value={formData.emergency_contact.name}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    emergency_contact: { ...prev.emergency_contact, name: e.target.value }
                                                }))}
                                                placeholder="Emergency contact name (optional)"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="emergency_relationship">Relationship</Label>
                                                <Input
                                                    id="emergency_relationship"
                                                    value={formData.emergency_contact.relationship}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        emergency_contact: { ...prev.emergency_contact, relationship: e.target.value }
                                                    }))}
                                                    placeholder="e.g., Spouse, Parent (optional)"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="emergency_phone">Phone</Label>
                                                <Input
                                                    id="emergency_phone"
                                                    value={formData.emergency_contact.phone}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        emergency_contact: { ...prev.emergency_contact, phone: e.target.value }
                                                    }))}
                                                    placeholder="Emergency contact phone (optional)"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="emergency_email">Email</Label>
                                            <Input
                                                id="emergency_email"
                                                type="email"
                                                value={formData.emergency_contact.email || ''}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    emergency_contact: { ...prev.emergency_contact, email: e.target.value }
                                                }))}
                                                placeholder="Emergency contact email"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="emergency_address">Address</Label>
                                            <Textarea
                                                id="emergency_address"
                                                value={formData.emergency_contact.address || ''}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    emergency_contact: { ...prev.emergency_contact, address: e.target.value }
                                                }))}
                                                placeholder="Emergency contact address"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="medical" className="space-y-6 mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <WarningIcon className="w-5 h-5 text-orange-500" />
                                                Allergies
                                            </h3>
                                            <Button type="button" variant="outline" size="sm" onClick={addAllergy}>
                                                <PlusIcon className="w-3 h-3 mr-1" />
                                                Add Allergy
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            {formData.allergies?.map((allergy, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <Input
                                                        value={allergy}
                                                        onChange={(e) => updateAllergy(index, e.target.value)}
                                                        placeholder="Enter allergy (e.g., Penicillin, Peanuts)"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeAllergy(index)}
                                                    >
                                                        <TrashIcon className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {formData.allergies?.length === 0 && (
                                                <p className="text-sm text-muted-foreground">No allergies recorded</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <HeartIcon className="w-5 h-5 text-red-500" />
                                                Chronic Conditions
                                            </h3>
                                            <Button type="button" variant="outline" size="sm" onClick={addChronicCondition}>
                                                <PlusIcon className="w-3 h-3 mr-1" />
                                                Add Condition
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            {formData.chronic_conditions?.map((condition, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <Input
                                                        value={condition}
                                                        onChange={(e) => updateChronicCondition(index, e.target.value)}
                                                        placeholder="Enter chronic condition (e.g., Diabetes, Hypertension)"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeChronicCondition(index)}
                                                    >
                                                        <TrashIcon className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {formData.chronic_conditions?.length === 0 && (
                                                <p className="text-sm text-muted-foreground">No chronic conditions recorded</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="vaccination" className="space-y-6 mt-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <SyringeIcon className="w-5 h-5 text-blue-500" />
                                        Vaccination Records
                                    </h3>
                                    <Button type="button" variant="outline" onClick={addVaccination}>
                                        <SyringeIcon className="w-4 h-4 mr-2" />
                                        Add Vaccination
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {formData.vaccination_records?.map((vaccination, index) => (
                                        <Card key={index} className="p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Vaccine Name</Label>
                                                    <Input
                                                        value={vaccination.vaccine_name}
                                                        onChange={(e) => updateVaccination(index, 'vaccine_name', e.target.value)}
                                                        placeholder="e.g., COVID-19, Hepatitis B"
                                                    />
                                                </div>

                                                <div>
                                                    <Label>Date Administered</Label>
                                                    <Input
                                                        type="date"
                                                        value={vaccination.date_administered}
                                                        onChange={(e) => updateVaccination(index, 'date_administered', e.target.value)}
                                                    />
                                                </div>

                                                <div>
                                                    <Label>Next Due Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={vaccination.next_due_date || ''}
                                                        onChange={(e) => updateVaccination(index, 'next_due_date', e.target.value)}
                                                    />
                                                </div>

                                                <div>
                                                    <Label>Administered By</Label>
                                                    <Input
                                                        value={vaccination.administered_by}
                                                        onChange={(e) => updateVaccination(index, 'administered_by', e.target.value)}
                                                        placeholder="Doctor/Nurse name"
                                                    />
                                                </div>

                                                <div>
                                                    <Label>Batch Number</Label>
                                                    <Input
                                                        value={vaccination.batch_number || ''}
                                                        onChange={(e) => updateVaccination(index, 'batch_number', e.target.value)}
                                                        placeholder="Vaccine batch number"
                                                    />
                                                </div>

                                                <div>
                                                    <Label>Notes</Label>
                                                    <Input
                                                        value={vaccination.notes || ''}
                                                        onChange={(e) => updateVaccination(index, 'notes', e.target.value)}
                                                        placeholder="Additional notes"
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="mt-4"
                                                onClick={() => removeVaccination(index)}
                                            >
                                                <TrashIcon className="w-3 h-3 mr-1" />
                                                Remove Vaccination
                                            </Button>
                                        </Card>
                                    ))}

                                    {formData.vaccination_records?.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <SyringeIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>No vaccination records</p>
                                            <p className="text-sm">Click "Add Vaccination" to add vaccination records</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="insurance" className="space-y-6 mt-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <ShieldIcon className="w-5 h-5 text-green-500" />
                                    <h3 className="text-lg font-semibold">Insurance Information</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label>Insurance Provider</Label>
                                        <Input
                                            value={formData.insurance_info?.provider || ''}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                insurance_info: {
                                                    ...prev.insurance_info,
                                                    provider: e.target.value,
                                                    policy_number: prev.insurance_info?.policy_number || '',
                                                    coverage_amount: prev.insurance_info?.coverage_amount || 0,
                                                    expiry_date: prev.insurance_info?.expiry_date || ''
                                                }
                                            }))}
                                            placeholder="e.g., Star Health, HDFC ERGO"
                                        />
                                    </div>

                                    <div>
                                        <Label>Policy Number</Label>
                                        <Input
                                            value={formData.insurance_info?.policy_number || ''}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                insurance_info: {
                                                    ...prev.insurance_info,
                                                    provider: prev.insurance_info?.provider || '',
                                                    policy_number: e.target.value,
                                                    coverage_amount: prev.insurance_info?.coverage_amount || 0,
                                                    expiry_date: prev.insurance_info?.expiry_date || ''
                                                }
                                            }))}
                                            placeholder="Policy number"
                                        />
                                    </div>

                                    <div>
                                        <Label>Coverage Amount (₹)</Label>
                                        <Input
                                            type="number"
                                            value={formData.insurance_info?.coverage_amount || 0}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                insurance_info: {
                                                    ...prev.insurance_info,
                                                    provider: prev.insurance_info?.provider || '',
                                                    policy_number: prev.insurance_info?.policy_number || '',
                                                    coverage_amount: parseFloat(e.target.value) || 0,
                                                    expiry_date: prev.insurance_info?.expiry_date || ''
                                                }
                                            }))}
                                            placeholder="Coverage amount"
                                        />
                                    </div>

                                    <div>
                                        <Label>Expiry Date</Label>
                                        <Input
                                            type="date"
                                            value={formData.insurance_info?.expiry_date || ''}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                insurance_info: {
                                                    ...prev.insurance_info,
                                                    provider: prev.insurance_info?.provider || '',
                                                    policy_number: prev.insurance_info?.policy_number || '',
                                                    coverage_amount: prev.insurance_info?.coverage_amount || 0,
                                                    expiry_date: e.target.value
                                                }
                                            }))}
                                        />
                                    </div>

                                    <div>
                                        <Label>Copay Amount (₹)</Label>
                                        <Input
                                            type="number"
                                            value={formData.insurance_info?.copay_amount || 0}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                insurance_info: {
                                                    ...prev.insurance_info,
                                                    provider: prev.insurance_info?.provider || '',
                                                    policy_number: prev.insurance_info?.policy_number || '',
                                                    coverage_amount: prev.insurance_info?.coverage_amount || 0,
                                                    expiry_date: prev.insurance_info?.expiry_date || '',
                                                    copay_amount: parseFloat(e.target.value) || 0
                                                }
                                            }))}
                                            placeholder="Copay amount"
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <FloppyDiskIcon className="w-4 h-4 mr-2" />
                                        Create Patient
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
