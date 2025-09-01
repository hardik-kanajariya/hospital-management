import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    TestTubeIcon,
    TrendUpIcon,
    TrendDownIcon,
    CheckCircleIcon,
    WarningIcon,
    XCircleIcon,
} from '@phosphor-icons/react'

interface LabResult {
    id?: string
    testName: string
    result: string | number
    normalRange: string
    unit?: string
    status?: 'normal' | 'high' | 'low' | 'critical'
    date?: string
    notes?: string
    reference?: string
}

interface LabResultsDisplayProps {
    labResults: LabResult[]
    className?: string
    compact?: boolean
    showActions?: boolean
    onViewDetails?: (result: LabResult) => void
}

export function LabResultsDisplay({
    labResults,
    className,
    compact = false,
    showActions = false,
    onViewDetails
}: LabResultsDisplayProps) {
    if (!labResults || labResults.length === 0) {
        return (
            <Card className={className}>
                <CardContent className="p-6 text-center text-muted-foreground">
                    <TestTubeIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No lab results available</p>
                </CardContent>
            </Card>
        )
    }

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'normal': return <CheckCircleIcon className="w-4 h-4 text-green-600" />
            case 'high': return <TrendUpIcon className="w-4 h-4 text-red-600" />
            case 'low': return <TrendDownIcon className="w-4 h-4 text-yellow-600" />
            case 'critical': return <XCircleIcon className="w-4 h-4 text-red-700" />
            default: return <WarningIcon className="w-4 h-4 text-gray-600" />
        }
    }

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'normal': return 'bg-green-100 text-green-800 border-green-200'
            case 'high': return 'bg-red-100 text-red-800 border-red-200'
            case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'critical': return 'bg-red-200 text-red-900 border-red-300'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getStatusBadgeColor = (status?: string) => {
        switch (status) {
            case 'normal': return 'bg-green-100 text-green-800'
            case 'high': return 'bg-red-100 text-red-800'
            case 'low': return 'bg-yellow-100 text-yellow-800'
            case 'critical': return 'bg-red-200 text-red-900'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    if (compact) {
        return (
            <div className={`space-y-2 ${className}`}>
                {labResults.map((result, index) => (
                    <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(result.status)}`}
                    >
                        <div className="flex items-center gap-3">
                            {getStatusIcon(result.status)}
                            <div>
                                <p className="font-medium text-sm">{result.testName}</p>
                                <p className="text-xs text-muted-foreground">
                                    {result.result} {result.unit} (Normal: {result.normalRange})
                                </p>
                            </div>
                        </div>
                        <Badge className={`text-xs ${getStatusBadgeColor(result.status)}`}>
                            {result.status || 'Pending'}
                        </Badge>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TestTubeIcon className="w-5 h-5" />
                    Lab Results ({labResults.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {labResults.map((result, index) => (
                        <Card key={index} className={`border-l-4 ${result.status === 'normal' ? 'border-l-green-500' :
                                result.status === 'high' || result.status === 'critical' ? 'border-l-red-500' :
                                    result.status === 'low' ? 'border-l-yellow-500' :
                                        'border-l-gray-500'
                            }`}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getStatusIcon(result.status)}
                                            <h4 className="font-semibold">{result.testName}</h4>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium">Result:</span>
                                                <p className={`text-lg font-bold ${result.status === 'critical' ? 'text-red-700' :
                                                        result.status === 'high' ? 'text-red-600' :
                                                            result.status === 'low' ? 'text-yellow-600' :
                                                                result.status === 'normal' ? 'text-green-600' :
                                                                    'text-gray-600'
                                                    }`}>
                                                    {result.result} {result.unit}
                                                </p>
                                            </div>

                                            <div>
                                                <span className="font-medium">Normal Range:</span>
                                                <p className="text-muted-foreground">{result.normalRange}</p>
                                            </div>

                                            {result.date && (
                                                <div>
                                                    <span className="font-medium">Date:</span>
                                                    <p className="text-muted-foreground">{result.date}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Badge className={getStatusBadgeColor(result.status)}>
                                            {result.status || 'Pending'}
                                        </Badge>
                                        {showActions && onViewDetails && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onViewDetails(result)}
                                            >
                                                View Details
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {result.notes && (
                                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                        <h5 className="font-medium text-sm mb-1">Notes:</h5>
                                        <p className="text-sm text-muted-foreground">{result.notes}</p>
                                    </div>
                                )}

                                {result.reference && (
                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <h5 className="font-medium text-sm text-blue-800 mb-1">Reference:</h5>
                                        <p className="text-sm text-blue-700">{result.reference}</p>
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

export default LabResultsDisplay
