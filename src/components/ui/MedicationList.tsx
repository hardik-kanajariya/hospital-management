import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    PillIcon,
    ClockIcon,
    CalendarIcon,
    WarningIcon,
    InfoIcon,
} from '@phosphor-icons/react'

interface Medication {
    id?: string
    name: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
    startDate?: string
    endDate?: string
    prescribedBy?: string
    status?: 'active' | 'completed' | 'discontinued'
}

interface MedicationListProps {
    medications: Medication[]
    className?: string
    compact?: boolean
    showActions?: boolean
    onEdit?: (medication: Medication) => void
    onDiscontinue?: (medication: Medication) => void
}

export function MedicationList({ 
    medications, 
    className, 
    compact = false, 
    showActions = false,
    onEdit,
    onDiscontinue 
}: MedicationListProps) {
    if (!medications || medications.length === 0) {
        return (
            <Card className={className}>
                <CardContent className="p-6 text-center text-muted-foreground">
                    <PillIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No medications prescribed</p>
                </CardContent>
            </Card>
        )
    }

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200'
            case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'discontinued': return 'bg-red-100 text-red-800 border-red-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getFrequencyDescription = (frequency: string) => {
        const frequencyMap: Record<string, string> = {
            'once_daily': 'Once daily',
            'twice_daily': 'Twice daily',
            'three_times_daily': 'Three times daily',
            'four_times_daily': 'Four times daily',
            'every_4_hours': 'Every 4 hours',
            'every_6_hours': 'Every 6 hours',
            'every_8_hours': 'Every 8 hours',
            'every_12_hours': 'Every 12 hours',
            'as_needed': 'As needed',
            'with_meals': 'With meals',
            'before_meals': 'Before meals',
            'at_bedtime': 'At bedtime'
        }
        return frequencyMap[frequency] || frequency
    }

    if (compact) {
        return (
            <div className={`space-y-2 ${className}`}>
                {medications.map((medication, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <PillIcon className="w-4 h-4 text-green-600" />
                            <div>
                                <p className="font-medium text-sm">{medication.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {medication.dosage} • {getFrequencyDescription(medication.frequency)}
                                </p>
                            </div>
                        </div>
                        {medication.status && (
                            <Badge className={`text-xs ${getStatusColor(medication.status)}`}>
                                {medication.status}
                            </Badge>
                        )}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PillIcon className="w-5 h-5" />
                    Medications ({medications.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {medications.map((medication, index) => (
                        <Card key={index} className="border-l-4 border-l-green-500">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-semibold text-lg">{medication.name}</h4>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <PillIcon className="w-4 h-4" />
                                                {medication.dosage}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <ClockIcon className="w-4 h-4" />
                                                {getFrequencyDescription(medication.frequency)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <CalendarIcon className="w-4 h-4" />
                                                {medication.duration}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {medication.status && (
                                            <Badge className={getStatusColor(medication.status)}>
                                                {medication.status}
                                            </Badge>
                                        )}
                                        {showActions && (
                                            <div className="flex gap-1">
                                                {onEdit && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onEdit(medication)}
                                                    >
                                                        Edit
                                                    </Button>
                                                )}
                                                {onDiscontinue && medication.status === 'active' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onDiscontinue(medication)}
                                                    >
                                                        Discontinue
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {medication.instructions && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                        <div className="flex items-start gap-2">
                                            <InfoIcon className="w-4 h-4 text-blue-600 mt-0.5" />
                                            <div>
                                                <h5 className="font-medium text-sm text-blue-800 mb-1">Instructions</h5>
                                                <p className="text-sm text-blue-700">{medication.instructions}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(medication.startDate || medication.endDate || medication.prescribedBy) && (
                                    <div className="border-t pt-3 mt-3">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                            {medication.startDate && (
                                                <div>
                                                    <span className="font-medium">Start Date:</span>
                                                    <p className="text-muted-foreground">{medication.startDate}</p>
                                                </div>
                                            )}
                                            {medication.endDate && (
                                                <div>
                                                    <span className="font-medium">End Date:</span>
                                                    <p className="text-muted-foreground">{medication.endDate}</p>
                                                </div>
                                            )}
                                            {medication.prescribedBy && (
                                                <div>
                                                    <span className="font-medium">Prescribed by:</span>
                                                    <p className="text-muted-foreground">{medication.prescribedBy}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default MedicationList
