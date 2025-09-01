import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import {
    CalendarIcon,
    FileTextIcon,
    StethoscopeIcon,
    PillIcon,
    TestTubeIcon,
    ActivityIcon,
    ClockIcon,
    EyeIcon,
} from '@phosphor-icons/react'

interface TimelineEvent {
    id: string
    type: 'medical_record' | 'appointment' | 'lab_test' | 'prescription' | 'vital_signs'
    date: string
    title: string
    description?: string
    status?: string
    data?: any
    relatedTo?: {
        type: string
        id: string
        name: string
    }
}

interface MedicalTimelineProps {
    events: TimelineEvent[]
    className?: string
    maxItems?: number
    showViewAll?: boolean
}

export function MedicalTimeline({ 
    events, 
    className, 
    maxItems = 10,
    showViewAll = true 
}: MedicalTimelineProps) {
    const navigate = useNavigate()

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'medical_record': return FileTextIcon
            case 'appointment': return CalendarIcon
            case 'lab_test': return TestTubeIcon
            case 'prescription': return PillIcon
            case 'vital_signs': return ActivityIcon
            default: return FileTextIcon
        }
    }

    const getEventColor = (type: string) => {
        switch (type) {
            case 'medical_record': return 'text-blue-600 bg-blue-100'
            case 'appointment': return 'text-green-600 bg-green-100'
            case 'lab_test': return 'text-purple-600 bg-purple-100'
            case 'prescription': return 'text-orange-600 bg-orange-100'
            case 'vital_signs': return 'text-red-600 bg-red-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const getEventTypeLabel = (type: string) => {
        switch (type) {
            case 'medical_record': return 'Medical Record'
            case 'appointment': return 'Appointment'
            case 'lab_test': return 'Lab Test'
            case 'prescription': return 'Prescription'
            case 'vital_signs': return 'Vital Signs'
            default: return 'Event'
        }
    }

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date)
        } catch {
            return dateString
        }
    }

    const sortedEvents = events
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, maxItems)

    if (events.length === 0) {
        return (
            <Card className={className}>
                <CardContent className="p-6 text-center text-muted-foreground">
                    <ClockIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No medical events recorded</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={className}>
            <CardContent className="p-6">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <ClockIcon className="w-5 h-5" />
                            Medical Timeline
                        </h3>
                        {showViewAll && events.length > maxItems && (
                            <Button variant="outline" size="sm">
                                View All ({events.length})
                            </Button>
                        )}
                    </div>

                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>

                        <div className="space-y-6">
                            {sortedEvents.map((event, index) => {
                                const Icon = getEventIcon(event.type)
                                const colorClasses = getEventColor(event.type)

                                return (
                                    <div key={event.id} className="relative flex items-start gap-4">
                                        {/* Timeline dot */}
                                        <div className={`relative z-10 w-12 h-12 rounded-full ${colorClasses} flex items-center justify-center`}>
                                            <Icon className="w-5 h-5" />
                                        </div>

                                        {/* Event content */}
                                        <div className="flex-1 min-w-0 pb-6">
                                            <div className="bg-muted/30 rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant="outline" className="text-xs">
                                                                {getEventTypeLabel(event.type)}
                                                            </Badge>
                                                            <span className="text-sm text-muted-foreground">
                                                                {formatDate(event.date)}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-medium">{event.title}</h4>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            // Navigate based on event type
                                                            switch (event.type) {
                                                                case 'medical_record':
                                                                    navigate(`/medical-records/${event.id}`)
                                                                    break
                                                                case 'appointment':
                                                                    navigate(`/appointments/${event.id}`)
                                                                    break
                                                                case 'lab_test':
                                                                    navigate(`/lab-tests/${event.id}`)
                                                                    break
                                                                case 'prescription':
                                                                    navigate(`/prescriptions/${event.id}`)
                                                                    break
                                                                default:
                                                                    break
                                                            }
                                                        }}
                                                    >
                                                        <EyeIcon className="w-4 h-4 mr-1" />
                                                        View
                                                    </Button>
                                                </div>

                                                {event.description && (
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        {event.description}
                                                    </p>
                                                )}

                                                {event.status && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-medium">Status:</span>
                                                        <Badge 
                                                            variant="outline" 
                                                            className={
                                                                event.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }
                                                        >
                                                            {event.status}
                                                        </Badge>
                                                    </div>
                                                )}

                                                {event.relatedTo && (
                                                    <div className="mt-2 text-xs text-muted-foreground">
                                                        Related to: {event.relatedTo.name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {events.length > maxItems && (
                        <div className="text-center pt-4 border-t">
                            <p className="text-sm text-muted-foreground mb-2">
                                Showing {maxItems} of {events.length} events
                            </p>
                            <Button variant="outline" size="sm">
                                Load More Events
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default MedicalTimeline
