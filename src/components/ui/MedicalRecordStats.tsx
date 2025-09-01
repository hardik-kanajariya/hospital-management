import React from 'react'
import { Card } from '@/components/ui/card'
import {
    FileTextIcon,
    PillIcon,
    TestTubeIcon,
    CalendarIcon,
    TrendUpIcon,
    ActivityIcon,
} from '@phosphor-icons/react'

interface MedicalRecord {
    id: string
    visitDate: string
    medications?: any[]
    labResults?: any[]
    followUpInstructions?: string[]
    vitalSigns?: Record<string, any>
    nextVisitDate?: string
}

interface MedicalRecordStatsProps {
    records: MedicalRecord[]
    className?: string
}

export function MedicalRecordStats({ records, className }: MedicalRecordStatsProps) {
    const stats = React.useMemo(() => {
        const totalRecords = records.length
        const withMedications = records.filter(r => r.medications && r.medications.length > 0).length
        const withLabResults = records.filter(r => r.labResults && r.labResults.length > 0).length
        const withFollowUps = records.filter(r => r.followUpInstructions && r.followUpInstructions.length > 0).length
        const withVitalSigns = records.filter(r => r.vitalSigns && Object.keys(r.vitalSigns).length > 0).length
        const upcomingVisits = records.filter(r => r.nextVisitDate && new Date(r.nextVisitDate) > new Date()).length

        // Recent activity (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const recentRecords = records.filter(r => new Date(r.visitDate) > thirtyDaysAgo).length

        return {
            totalRecords,
            withMedications,
            withLabResults,
            withFollowUps,
            withVitalSigns,
            upcomingVisits,
            recentRecords
        }
    }, [records])

    const statsData = [
        {
            title: 'Total Records',
            value: stats.totalRecords,
            icon: FileTextIcon,
            color: 'text-primary',
            bgColor: 'bg-primary/10'
        },
        {
            title: 'With Medications',
            value: stats.withMedications,
            icon: PillIcon,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'With Lab Results',
            value: stats.withLabResults,
            icon: TestTubeIcon,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            title: 'With Follow-ups',
            value: stats.withFollowUps,
            icon: CalendarIcon,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        },
        {
            title: 'With Vital Signs',
            value: stats.withVitalSigns,
            icon: ActivityIcon,
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        },
        {
            title: 'Recent (30 days)',
            value: stats.recentRecords,
            icon: TrendUpIcon,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        }
    ]

    return (
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${className}`}>
            {statsData.map((stat, index) => {
                const Icon = stat.icon
                return (
                    <Card key={index} className="p-4">
                        <div className="text-center">
                            <div className={`w-12 h-12 mx-auto mb-2 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                                <Icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-sm text-muted-foreground">{stat.title}</p>
                        </div>
                    </Card>
                )
            })}
        </div>
    )
}

export default MedicalRecordStats
