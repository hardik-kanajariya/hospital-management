import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
    ShieldIcon,
    CameraIcon,
    UploadIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    PlusIcon,
    TrashIcon,
    CreditCardIcon,
    IdentificationCardIcon
} from '@phosphor-icons/react'
import { PatientInsurance } from '@/types/patient'

interface InsuranceInformationStepProps {
    data: PatientInsurance[]
    onChange: (data: PatientInsurance[]) => void
}

export default function InsuranceInformationStep({ data, onChange }: InsuranceInformationStepProps) {
    const [activeInsurance, setActiveInsurance] = useState(0)
    const [verifyingInsurance, setVerifyingInsurance] = useState<string | null>(null)

    const addInsurance = () => {
        const newInsurance: PatientInsurance = {
            id: `temp-${Date.now()}`,
            patient_id: '',
            insurance_type: data.length === 0 ? 'primary' : data.length === 1 ? 'secondary' : 'tertiary',
            provider_name: '',
            policy_number: '',
            group_number: '',
            subscriber_name: '',
            subscriber_relationship: 'self',
            subscriber_dob: '',
            effective_date: '',
            expiry_date: '',
            copay_amount: 0,
            deductible_amount: 0,
            coverage_details: {},
            verification_status: 'pending',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        onChange([...data, newInsurance])
        setActiveInsurance(data.length)
    }

    const updateInsurance = (index: number, field: keyof PatientInsurance, value: any) => {
        const updated = data.map((insurance, i) =>
            i === index ? { ...insurance, [field]: value } : insurance
        )
        onChange(updated)
    }

    const removeInsurance = (index: number) => {
        const updated = data.filter((_, i) => i !== index)
        onChange(updated)

        if (activeInsurance >= updated.length && updated.length > 0) {
            setActiveInsurance(updated.length - 1)
        } else if (updated.length === 0) {
            setActiveInsurance(0)
        }
    }

    const verifyInsurance = async (index: number) => {
        const insurance = data[index]
        if (!insurance.provider_name || !insurance.policy_number) {
            toast.error('Provider name and policy number are required for verification')
            return
        }

        setVerifyingInsurance(insurance.id)

        try {
            // Simulate API call for insurance verification
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Simulate verification result
            const isValid = Math.random() > 0.3 // 70% success rate for demo

            updateInsurance(index, 'verification_status', isValid ? 'verified' : 'failed')
            updateInsurance(index, 'verified_date', new Date().toISOString())

            if (isValid) {
                toast.success('Insurance verified successfully')
                // Update coverage details from verification response
                updateInsurance(index, 'coverage_details', {
                    coverage_percentage: 80,
                    annual_maximum: 50000,
                    deductible_remaining: 1500,
                    in_network: true,
                    prior_auth_required: false
                })
            } else {
                toast.error('Insurance verification failed. Please check the details.')
            }
        } catch (error) {
            toast.error('Error verifying insurance')
            updateInsurance(index, 'verification_status', 'failed')
        } finally {
            setVerifyingInsurance(null)
        }
    }

    const handleCardUpload = (index: number, side: 'front' | 'back', file: File) => {
        const field = side === 'front' ? 'card_front_image' : 'card_back_image'
        updateInsurance(index, field, URL.createObjectURL(file))
        toast.success(`Insurance card ${side} uploaded successfully`)
    }

    const getVerificationStatusBadge = (status: string) => {
        switch (status) {
            case 'verified':
                return <Badge className="bg-green-100 text-green-800"><CheckCircleIcon className="w-3 h-3 mr-1" />Verified</Badge>
            case 'failed':
                return <Badge variant="destructive"><XCircleIcon className="w-3 h-3 mr-1" />Failed</Badge>
            case 'expired':
                return <Badge variant="outline" className="text-orange-600"><ClockIcon className="w-3 h-3 mr-1" />Expired</Badge>
            default:
                return <Badge variant="outline"><ClockIcon className="w-3 h-3 mr-1" />Pending</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <ShieldIcon className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Insurance Information</h2>
            </div>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <ShieldIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h3 className="font-medium text-blue-900">Insurance Information</h3>
                            <p className="text-sm text-blue-700 mt-1">
                                Add your insurance details for coverage verification and billing.
                                You can add up to 3 insurance plans (Primary, Secondary, Tertiary).
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Insurance Plans */}
            {data.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-12">
                        <CreditCardIcon className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Insurance Plans Added</h3>
                        <p className="text-muted-foreground text-center mb-4">
                            Add your insurance information to enable coverage verification and streamline billing.
                        </p>
                        <Button onClick={addInsurance}>
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Primary Insurance
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Insurance Plans</CardTitle>
                            {data.length < 3 && (
                                <Button variant="outline" size="sm" onClick={addInsurance}>
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    Add {data.length === 1 ? 'Secondary' : 'Tertiary'} Insurance
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeInsurance.toString()} onValueChange={(value) => setActiveInsurance(parseInt(value))}>
                            <TabsList className="w-full">
                                {data.map((insurance, index) => (
                                    <TabsTrigger key={index} value={index.toString()} className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="capitalize">{insurance.insurance_type}</span>
                                            {getVerificationStatusBadge(insurance.verification_status)}
                                        </div>
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {data.map((insurance, index) => (
                                <TabsContent key={index} value={index.toString()} className="space-y-6 mt-6">
                                    {/* Insurance Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor={`provider_${index}`}>Insurance Provider *</Label>
                                            <Input
                                                id={`provider_${index}`}
                                                value={insurance.provider_name}
                                                onChange={(e) => updateInsurance(index, 'provider_name', e.target.value)}
                                                placeholder="Enter insurance provider name"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor={`policy_${index}`}>Policy Number *</Label>
                                            <Input
                                                id={`policy_${index}`}
                                                value={insurance.policy_number}
                                                onChange={(e) => updateInsurance(index, 'policy_number', e.target.value)}
                                                placeholder="Enter policy number"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor={`group_${index}`}>Group Number</Label>
                                            <Input
                                                id={`group_${index}`}
                                                value={insurance.group_number || ''}
                                                onChange={(e) => updateInsurance(index, 'group_number', e.target.value)}
                                                placeholder="Enter group number"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor={`subscriber_${index}`}>Subscriber Name *</Label>
                                            <Input
                                                id={`subscriber_${index}`}
                                                value={insurance.subscriber_name}
                                                onChange={(e) => updateInsurance(index, 'subscriber_name', e.target.value)}
                                                placeholder="Enter subscriber name"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor={`relationship_${index}`}>Relationship to Subscriber</Label>
                                            <Select
                                                value={insurance.subscriber_relationship}
                                                onValueChange={(value) => updateInsurance(index, 'subscriber_relationship', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select relationship" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="self">Self</SelectItem>
                                                    <SelectItem value="spouse">Spouse</SelectItem>
                                                    <SelectItem value="child">Child</SelectItem>
                                                    <SelectItem value="parent">Parent</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor={`subscriber_dob_${index}`}>Subscriber Date of Birth</Label>
                                            <Input
                                                id={`subscriber_dob_${index}`}
                                                type="date"
                                                value={insurance.subscriber_dob || ''}
                                                onChange={(e) => updateInsurance(index, 'subscriber_dob', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor={`effective_${index}`}>Effective Date *</Label>
                                            <Input
                                                id={`effective_${index}`}
                                                type="date"
                                                value={insurance.effective_date}
                                                onChange={(e) => updateInsurance(index, 'effective_date', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor={`expiry_${index}`}>Expiry Date</Label>
                                            <Input
                                                id={`expiry_${index}`}
                                                type="date"
                                                value={insurance.expiry_date || ''}
                                                onChange={(e) => updateInsurance(index, 'expiry_date', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor={`copay_${index}`}>Copay Amount ($)</Label>
                                            <Input
                                                id={`copay_${index}`}
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={insurance.copay_amount || ''}
                                                onChange={(e) => updateInsurance(index, 'copay_amount', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor={`deductible_${index}`}>Deductible Amount ($)</Label>
                                            <Input
                                                id={`deductible_${index}`}
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={insurance.deductible_amount || ''}
                                                onChange={(e) => updateInsurance(index, 'deductible_amount', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    {/* Insurance Card Upload */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Insurance Card Images</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Front Card */}
                                                <div>
                                                    <Label>Card Front</Label>
                                                    <div className="mt-2 border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                                                        {insurance.card_front_image ? (
                                                            <div className="space-y-2">
                                                                <img
                                                                    src={insurance.card_front_image}
                                                                    alt="Insurance card front"
                                                                    className="w-full h-32 object-cover rounded"
                                                                />
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => document.getElementById(`front-upload-${index}`)?.click()}
                                                                >
                                                                    Replace Image
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center">
                                                                <IdentificationCardIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                                                                <div className="mt-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={() => document.getElementById(`front-upload-${index}`)?.click()}
                                                                    >
                                                                        <UploadIcon className="w-4 h-4 mr-2" />
                                                                        Upload Front
                                                                    </Button>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    Clear image of front side
                                                                </p>
                                                            </div>
                                                        )}
                                                        <input
                                                            id={`front-upload-${index}`}
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0]
                                                                if (file) handleCardUpload(index, 'front', file)
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Back Card */}
                                                <div>
                                                    <Label>Card Back</Label>
                                                    <div className="mt-2 border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                                                        {insurance.card_back_image ? (
                                                            <div className="space-y-2">
                                                                <img
                                                                    src={insurance.card_back_image}
                                                                    alt="Insurance card back"
                                                                    className="w-full h-32 object-cover rounded"
                                                                />
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => document.getElementById(`back-upload-${index}`)?.click()}
                                                                >
                                                                    Replace Image
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center">
                                                                <IdentificationCardIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                                                                <div className="mt-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={() => document.getElementById(`back-upload-${index}`)?.click()}
                                                                    >
                                                                        <UploadIcon className="w-4 h-4 mr-2" />
                                                                        Upload Back
                                                                    </Button>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    Clear image of back side
                                                                </p>
                                                            </div>
                                                        )}
                                                        <input
                                                            id={`back-upload-${index}`}
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0]
                                                                if (file) handleCardUpload(index, 'back', file)
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Verification Section */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <CheckCircleIcon className="w-5 h-5" />
                                                Insurance Verification
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Verification Status</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {getVerificationStatusBadge(insurance.verification_status)}
                                                        {insurance.verified_date && (
                                                            <span className="text-sm text-muted-foreground">
                                                                Verified on {new Date(insurance.verified_date).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <Button
                                                    onClick={() => verifyInsurance(index)}
                                                    disabled={verifyingInsurance === insurance.id}
                                                    variant={insurance.verification_status === 'verified' ? 'outline' : 'default'}
                                                >
                                                    {verifyingInsurance === insurance.id ? (
                                                        <>
                                                            <ClockIcon className="w-4 h-4 mr-2 animate-spin" />
                                                            Verifying...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircleIcon className="w-4 h-4 mr-2" />
                                                            {insurance.verification_status === 'verified' ? 'Re-verify' : 'Verify Coverage'}
                                                        </>
                                                    )}
                                                </Button>
                                            </div>

                                            {/* Coverage Details */}
                                            {insurance.verification_status === 'verified' && insurance.coverage_details && (
                                                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                                                    <h4 className="font-medium text-green-900 mb-2">Coverage Details</h4>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-green-700">Coverage:</span>
                                                            <span className="ml-2 font-medium">{insurance.coverage_details.coverage_percentage}%</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-green-700">Annual Max:</span>
                                                            <span className="ml-2 font-medium">${insurance.coverage_details.annual_maximum?.toLocaleString()}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-green-700">Deductible Remaining:</span>
                                                            <span className="ml-2 font-medium">${insurance.coverage_details.deductible_remaining}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-green-700">Network Status:</span>
                                                            <span className="ml-2 font-medium">
                                                                {insurance.coverage_details.in_network ? 'In-Network' : 'Out-of-Network'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Remove Insurance */}
                                    <div className="flex justify-end">
                                        <Button
                                            variant="outline"
                                            onClick={() => removeInsurance(index)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <TrashIcon className="w-4 h-4 mr-2" />
                                            Remove Insurance
                                        </Button>
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
