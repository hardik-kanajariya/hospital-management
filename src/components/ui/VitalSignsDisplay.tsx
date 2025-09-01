import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    ThermometerIcon,
    HeartIcon,
    PlugsIcon,
    DropIcon,
    ScalesIcon,
    RulerIcon,
} from '@phosphor-icons/react'

interface VitalSigns {
    temperature?: number | string
    bloodPressure?: {
        systolic: number
        diastolic: number
    } | string
    heartRate?: number | string
    respiratoryRate?: number | string
    oxygenSaturation?: number | string
    weight?: number | string
    height?: number | string
    [key: string]: any
}

interface VitalSignsDisplayProps {
    vitalSigns: VitalSigns
    className?: string
    compact?: boolean
}

export function VitalSignsDisplay({ vitalSigns, className, compact = false }: VitalSignsDisplayProps) {
    // Helper function to determine if a value is normal
    const getVitalStatus = (type: string, value: number | string): 'normal' | 'warning' | 'critical' => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value

        if (isNaN(numValue)) return 'normal'

        switch (type) {
            case 'temperature':
                if (numValue < 36.1 || numValue > 37.2) return numValue < 35 || numValue > 39 ? 'critical' : 'warning'
                return 'normal'
            case 'heartRate':
                if (numValue < 60 || numValue > 100) return numValue < 40 || numValue > 120 ? 'critical' : 'warning'
                return 'normal'
            case 'respiratoryRate':
                if (numValue < 12 || numValue > 20) return numValue < 8 || numValue > 30 ? 'critical' : 'warning'
                return 'normal'
            case 'oxygenSaturation':
                if (numValue < 95) return numValue < 90 ? 'critical' : 'warning'
                return 'normal'
            case 'systolic':
                if (numValue < 90 || numValue > 140) return numValue < 70 || numValue > 180 ? 'critical' : 'warning'
                return 'normal'
            case 'diastolic':
                if (numValue < 60 || numValue > 90) return numValue < 40 || numValue > 110 ? 'critical' : 'warning'
                return 'normal'
            default:
                return 'normal'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200'
            case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            default: return 'bg-green-100 text-green-800 border-green-200'
        }
    }

    const vitalItems = [
        {
            key: 'temperature',
            label: 'Temperature',
            value: vitalSigns.temperature,
            unit: '°C',
            icon: ThermometerIcon,
            iconColor: 'text-red-500'
        },
        {
            key: 'bloodPressure',
            label: 'Blood Pressure',
            value: typeof vitalSigns.bloodPressure === 'object'
                ? `${vitalSigns.bloodPressure.systolic}/${vitalSigns.bloodPressure.diastolic}`
                : vitalSigns.bloodPressure,
            unit: 'mmHg',
            icon: DropIcon,
            iconColor: 'text-blue-500'
        },
        {
            key: 'heartRate',
            label: 'Heart Rate',
            value: vitalSigns.heartRate,
            unit: 'bpm',
            icon: HeartIcon,
            iconColor: 'text-red-500'
        },
        {
            key: 'respiratoryRate',
            label: 'Respiratory Rate',
            value: vitalSigns.respiratoryRate,
            unit: '/min',
            icon: PlugsIcon,
            iconColor: 'text-blue-500'
        },
        {
            key: 'oxygenSaturation',
            label: 'Oxygen Saturation',
            value: vitalSigns.oxygenSaturation,
            unit: '%',
            icon: PlugsIcon,
            iconColor: 'text-green-500'
        },
        {
            key: 'weight',
            label: 'Weight',
            value: vitalSigns.weight,
            unit: 'kg',
            icon: ScalesIcon,
            iconColor: 'text-purple-500'
        },
        {
            key: 'height',
            label: 'Height',
            value: vitalSigns.height,
            unit: 'cm',
            icon: RulerIcon,
            iconColor: 'text-orange-500'
        }
    ]

    const availableVitals = vitalItems.filter(item => item.value !== undefined && item.value !== null && item.value !== '')

    if (availableVitals.length === 0) {
        return (
            <Card className={className}>
                <CardContent className="p-6 text-center text-muted-foreground">
                    <PlugsIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No vital signs recorded</p>
                </CardContent>
            </Card>
        )
    }

    if (compact) {
        return (
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 ${className}`}>
                {availableVitals.map((vital) => {
                    const Icon = vital.icon
                    const status = vital.key === 'bloodPressure'
                        ? 'normal' // Handle BP separately due to complex structure
                        : getVitalStatus(vital.key, vital.value || 0)

                    return (
                        <div key={vital.key} className={`p-2 rounded-lg border ${getStatusColor(status)}`}>
                            <div className="flex items-center gap-2">
                                <Icon className={`w-4 h-4 ${vital.iconColor}`} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium truncate">{vital.label}</p>
                                    <p className="text-sm font-bold">
                                        {vital.value}{vital.unit}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HeartIcon className="w-5 h-5" />
                    Vital Signs
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableVitals.map((vital) => {
                        const Icon = vital.icon
                        const status = vital.key === 'bloodPressure'
                            ? 'normal' // Handle BP separately due to complex structure
                            : getVitalStatus(vital.key, vital.value || 0)

                        return (
                            <div key={vital.key} className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Icon className={`w-5 h-5 ${vital.iconColor}`} />
                                    <span className="text-sm font-medium">{vital.label}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold">
                                        {vital.value}{vital.unit}
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className={getStatusColor(status)}
                                    >
                                        {status === 'normal' ? 'Normal' : status === 'warning' ? 'Abnormal' : 'Critical'}
                                    </Badge>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}

export default VitalSignsDisplay
