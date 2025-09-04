import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
    HeartIcon,
    WarningIcon,
    SyringeIcon,
    PillIcon,
    UsersIcon,
    PlusIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    ClockIcon
} from '@phosphor-icons/react'
import { PatientAllergy, PatientMedication } from '@/types/patient'

interface MedicalHistoryData {
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

interface MedicalHistoryStepProps {
    data: MedicalHistoryData
    onChange: (data: MedicalHistoryData) => void
}

export default function MedicalHistoryStep({ data, onChange }: MedicalHistoryStepProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('allergies')

    // Allergy Management
    const addAllergy = () => {
        const newAllergy: PatientAllergy = {
            id: `temp-${Date.now()}`,
            patient_id: '',
            allergy_type: 'drug',
            allergen: '',
            severity: 'mild',
            reaction_type: '',
            onset_date: '',
            notes: '',
            status: 'active',
            reported_by: '',
            verified_by: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        onChange({
            ...data,
            allergies: [...data.allergies, newAllergy]
        })
    }

    const updateAllergy = (index: number, field: keyof PatientAllergy, value: any) => {
        const updated = data.allergies.map((allergy, i) =>
            i === index ? { ...allergy, [field]: value } : allergy
        )
        onChange({ ...data, allergies: updated })
    }

    const removeAllergy = (index: number) => {
        const updated = data.allergies.filter((_, i) => i !== index)
        onChange({ ...data, allergies: updated })
    }

    // Medication Management
    const addMedication = () => {
        const newMedication: PatientMedication = {
            id: `temp-${Date.now()}`,
            patient_id: '',
            medication_name: '',
            generic_name: '',
            dosage: '',
            frequency: '',
            route: 'oral',
            start_date: new Date().toISOString().split('T')[0],
            end_date: '',
            prescribed_by: '',
            pharmacy_name: '',
            reason: '',
            status: 'active',
            adherence_notes: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        onChange({
            ...data,
            medications: [...data.medications, newMedication]
        })
    }

    const updateMedication = (index: number, field: keyof PatientMedication, value: any) => {
        const updated = data.medications.map((medication, i) =>
            i === index ? { ...medication, [field]: value } : medication
        )
        onChange({ ...data, medications: updated })
    }

    const removeMedication = (index: number) => {
        const updated = data.medications.filter((_, i) => i !== index)
        onChange({ ...data, medications: updated })
    }

    // Chronic Conditions Management
    const addChronicCondition = () => {
        onChange({
            ...data,
            chronic_conditions: [...data.chronic_conditions, '']
        })
    }

    const updateChronicCondition = (index: number, value: string) => {
        const updated = data.chronic_conditions.map((condition, i) =>
            i === index ? value : condition
        )
        onChange({ ...data, chronic_conditions: updated })
    }

    const removeChronicCondition = (index: number) => {
        const updated = data.chronic_conditions.filter((_, i) => i !== index)
        onChange({ ...data, chronic_conditions: updated })
    }

    // Family History Management
    const addFamilyHistory = () => {
        onChange({
            ...data,
            family_history: [...data.family_history, {
                relationship: '',
                condition: '',
                age_at_diagnosis: undefined,
                current_status: 'living',
                notes: ''
            }]
        })
    }

    const updateFamilyHistory = (index: number, field: string, value: any) => {
        const updated = data.family_history.map((history, i) =>
            i === index ? { ...history, [field]: value } : history
        )
        onChange({ ...data, family_history: updated })
    }

    const removeFamilyHistory = (index: number) => {
        const updated = data.family_history.filter((_, i) => i !== index)
        onChange({ ...data, family_history: updated })
    }

    const getSeverityBadge = (severity: string) => {
        const colors = {
            mild: 'bg-yellow-100 text-yellow-800',
            moderate: 'bg-orange-100 text-orange-800',
            severe: 'bg-red-100 text-red-800',
            'life-threatening': 'bg-red-200 text-red-900'
        }
        return <Badge className={colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
            {severity}
        </Badge>
    }

    const getStatusBadge = (status: string) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            discontinued: 'bg-gray-100 text-gray-800',
            completed: 'bg-blue-100 text-blue-800'
        }
        return <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
            {status}
        </Badge>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <HeartIcon className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Medical History</h2>
            </div>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <HeartIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h3 className="font-medium text-blue-900">Medical History Information</h3>
                            <p className="text-sm text-blue-700 mt-1">
                                Complete medical history helps provide better care and avoid potential complications.
                                All information is kept confidential and secure.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="allergies" className="flex items-center gap-2">
                        <WarningIcon className="w-4 h-4" />
                        Allergies
                        {data.allergies.length > 0 && (
                            <Badge variant="secondary" className="ml-1">{data.allergies.length}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="medications" className="flex items-center gap-2">
                        <PillIcon className="w-4 h-4" />
                        Medications
                        {data.medications.length > 0 && (
                            <Badge variant="secondary" className="ml-1">{data.medications.length}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="conditions" className="flex items-center gap-2">
                        <HeartIcon className="w-4 h-4" />
                        Conditions
                        {data.chronic_conditions.length > 0 && (
                            <Badge variant="secondary" className="ml-1">{data.chronic_conditions.length}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="family" className="flex items-center gap-2">
                        <UsersIcon className="w-4 h-4" />
                        Family History
                        {data.family_history.length > 0 && (
                            <Badge variant="secondary" className="ml-1">{data.family_history.length}</Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Allergies Tab */}
                <TabsContent value="allergies" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Known Allergies</h3>
                        <Button onClick={addAllergy} size="sm">
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Allergy
                        </Button>
                    </div>

                    {data.allergies.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center p-8">
                                <WarningIcon className="w-12 h-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No Known Allergies</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    Add any known allergies to help prevent adverse reactions.
                                </p>
                                <Button onClick={addAllergy} variant="outline">
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    Add First Allergy
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {data.allergies.map((allergy, index) => (
                                <Card key={index}>
                                    <CardContent className="p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor={`allergy_type_${index}`}>Allergy Type</Label>
                                                <Select
                                                    value={allergy.allergy_type}
                                                    onValueChange={(value) => updateAllergy(index, 'allergy_type', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="drug">Drug/Medication</SelectItem>
                                                        <SelectItem value="food">Food</SelectItem>
                                                        <SelectItem value="environmental">Environmental</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor={`allergen_${index}`}>Allergen</Label>
                                                <Input
                                                    id={`allergen_${index}`}
                                                    value={allergy.allergen}
                                                    onChange={(e) => updateAllergy(index, 'allergen', e.target.value)}
                                                    placeholder="Enter allergen name"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor={`severity_${index}`}>Severity</Label>
                                                <Select
                                                    value={allergy.severity}
                                                    onValueChange={(value) => updateAllergy(index, 'severity', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select severity" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="mild">Mild</SelectItem>
                                                        <SelectItem value="moderate">Moderate</SelectItem>
                                                        <SelectItem value="severe">Severe</SelectItem>
                                                        <SelectItem value="life-threatening">Life-threatening</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor={`reaction_${index}`}>Reaction</Label>
                                                <Input
                                                    id={`reaction_${index}`}
                                                    value={allergy.reaction_type || ''}
                                                    onChange={(e) => updateAllergy(index, 'reaction_type', e.target.value)}
                                                    placeholder="Describe reaction"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor={`onset_${index}`}>Onset Date</Label>
                                                <Input
                                                    id={`onset_${index}`}
                                                    type="date"
                                                    value={allergy.onset_date || ''}
                                                    onChange={(e) => updateAllergy(index, 'onset_date', e.target.value)}
                                                />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {getSeverityBadge(allergy.severity)}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeAllergy(index)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {allergy.notes && (
                                            <div className="mt-4">
                                                <Label htmlFor={`allergy_notes_${index}`}>Notes</Label>
                                                <Textarea
                                                    id={`allergy_notes_${index}`}
                                                    value={allergy.notes}
                                                    onChange={(e) => updateAllergy(index, 'notes', e.target.value)}
                                                    placeholder="Additional notes about this allergy"
                                                    rows={2}
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Medications Tab */}
                <TabsContent value="medications" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Current Medications</h3>
                        <Button onClick={addMedication} size="sm">
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Medication
                        </Button>
                    </div>

                    {data.medications.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center p-8">
                                <PillIcon className="w-12 h-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No Current Medications</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    Add any medications you are currently taking.
                                </p>
                                <Button onClick={addMedication} variant="outline">
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    Add First Medication
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {data.medications.map((medication, index) => (
                                <Card key={index}>
                                    <CardContent className="p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor={`med_name_${index}`}>Medication Name</Label>
                                                <Input
                                                    id={`med_name_${index}`}
                                                    value={medication.medication_name}
                                                    onChange={(e) => updateMedication(index, 'medication_name', e.target.value)}
                                                    placeholder="Enter medication name"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor={`generic_name_${index}`}>Generic Name</Label>
                                                <Input
                                                    id={`generic_name_${index}`}
                                                    value={medication.generic_name || ''}
                                                    onChange={(e) => updateMedication(index, 'generic_name', e.target.value)}
                                                    placeholder="Enter generic name"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor={`dosage_${index}`}>Dosage</Label>
                                                <Input
                                                    id={`dosage_${index}`}
                                                    value={medication.dosage}
                                                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                                    placeholder="e.g., 500mg"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor={`frequency_${index}`}>Frequency</Label>
                                                <Select
                                                    value={medication.frequency}
                                                    onValueChange={(value) => updateMedication(index, 'frequency', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select frequency" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Once daily">Once daily</SelectItem>
                                                        <SelectItem value="Twice daily">Twice daily</SelectItem>
                                                        <SelectItem value="Three times daily">Three times daily</SelectItem>
                                                        <SelectItem value="Four times daily">Four times daily</SelectItem>
                                                        <SelectItem value="As needed">As needed</SelectItem>
                                                        <SelectItem value="Weekly">Weekly</SelectItem>
                                                        <SelectItem value="Monthly">Monthly</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor={`route_${index}`}>Route</Label>
                                                <Select
                                                    value={medication.route || 'oral'}
                                                    onValueChange={(value) => updateMedication(index, 'route', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select route" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="oral">Oral</SelectItem>
                                                        <SelectItem value="topical">Topical</SelectItem>
                                                        <SelectItem value="injection">Injection</SelectItem>
                                                        <SelectItem value="inhaled">Inhaled</SelectItem>
                                                        <SelectItem value="nasal">Nasal</SelectItem>
                                                        <SelectItem value="eye drops">Eye drops</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(medication.status)}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeMedication(index)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <div>
                                                <Label htmlFor={`start_date_${index}`}>Start Date</Label>
                                                <Input
                                                    id={`start_date_${index}`}
                                                    type="date"
                                                    value={medication.start_date}
                                                    onChange={(e) => updateMedication(index, 'start_date', e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor={`reason_${index}`}>Reason</Label>
                                                <Input
                                                    id={`reason_${index}`}
                                                    value={medication.reason || ''}
                                                    onChange={(e) => updateMedication(index, 'reason', e.target.value)}
                                                    placeholder="Reason for taking"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Chronic Conditions Tab */}
                <TabsContent value="conditions" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Chronic Conditions</h3>
                        <Button onClick={addChronicCondition} size="sm">
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Condition
                        </Button>
                    </div>

                    {data.chronic_conditions.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center p-8">
                                <HeartIcon className="w-12 h-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No Chronic Conditions</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    Add any ongoing medical conditions you have.
                                </p>
                                <Button onClick={addChronicCondition} variant="outline">
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    Add First Condition
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {data.chronic_conditions.map((condition, index) => (
                                <Card key={index}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <Input
                                                    value={condition}
                                                    onChange={(e) => updateChronicCondition(index, e.target.value)}
                                                    placeholder="Enter chronic condition"
                                                />
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeChronicCondition(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Family History Tab */}
                <TabsContent value="family" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Family Medical History</h3>
                        <Button onClick={addFamilyHistory} size="sm">
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Family History
                        </Button>
                    </div>

                    {data.family_history.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center p-8">
                                <UsersIcon className="w-12 h-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No Family History</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    Add family medical history to help assess genetic risk factors.
                                </p>
                                <Button onClick={addFamilyHistory} variant="outline">
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    Add First Entry
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {data.family_history.map((history, index) => (
                                <Card key={index}>
                                    <CardContent className="p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor={`fh_relationship_${index}`}>Relationship</Label>
                                                <Select
                                                    value={history.relationship}
                                                    onValueChange={(value) => updateFamilyHistory(index, 'relationship', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select relationship" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="father">Father</SelectItem>
                                                        <SelectItem value="mother">Mother</SelectItem>
                                                        <SelectItem value="sibling">Sibling</SelectItem>
                                                        <SelectItem value="grandparent">Grandparent</SelectItem>
                                                        <SelectItem value="aunt">Aunt</SelectItem>
                                                        <SelectItem value="uncle">Uncle</SelectItem>
                                                        <SelectItem value="cousin">Cousin</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor={`fh_condition_${index}`}>Condition</Label>
                                                <Input
                                                    id={`fh_condition_${index}`}
                                                    value={history.condition}
                                                    onChange={(e) => updateFamilyHistory(index, 'condition', e.target.value)}
                                                    placeholder="Medical condition"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor={`fh_age_${index}`}>Age at Diagnosis</Label>
                                                <Input
                                                    id={`fh_age_${index}`}
                                                    type="number"
                                                    min="0"
                                                    max="120"
                                                    value={history.age_at_diagnosis || ''}
                                                    onChange={(e) => updateFamilyHistory(index, 'age_at_diagnosis', parseInt(e.target.value) || undefined)}
                                                    placeholder="Age"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor={`fh_status_${index}`}>Current Status</Label>
                                                <Select
                                                    value={history.current_status || 'living'}
                                                    onValueChange={(value) => updateFamilyHistory(index, 'current_status', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="living">Living</SelectItem>
                                                        <SelectItem value="deceased">Deceased</SelectItem>
                                                        <SelectItem value="unknown">Unknown</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="md:col-span-2 lg:col-span-1">
                                                <div className="flex items-center justify-end h-full">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeFamilyHistory(index)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <Label htmlFor={`fh_notes_${index}`}>Notes</Label>
                                            <Textarea
                                                id={`fh_notes_${index}`}
                                                value={history.notes || ''}
                                                onChange={(e) => updateFamilyHistory(index, 'notes', e.target.value)}
                                                placeholder="Additional information about this family history"
                                                rows={2}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
