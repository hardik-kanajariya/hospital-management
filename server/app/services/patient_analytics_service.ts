import { DateTime } from 'luxon'
import Patient from '#models/patient'
import Appointment from '#models/appointment'

interface DemographicAnalysis {
    totalPatients: number
    ageDistribution: {
        ageGroup: string
        count: number
        percentage: number
    }[]
    genderDistribution: {
        gender: string
        count: number
        percentage: number
    }[]
    geographicDistribution: {
        region: string
        count: number
        percentage: number
    }[]
    insuranceDistribution: {
        type: string
        count: number
        percentage: number
    }[]
}

interface DiseasePrevalenceReport {
    condition: string
    totalCases: number
    prevalenceRate: number
    ageDistribution: {
        ageGroup: string
        cases: number
        rate: number
    }[]
    genderDistribution: {
        gender: string
        cases: number
        rate: number
    }[]
    trend: {
        period: string
        cases: number
        change: number
    }[]
}

interface PatientFlowAnalysis {
    totalAppointments: number
    averageWaitTime: number
    appointmentTypes: {
        type: string
        count: number
        averageDuration: number
    }[]
    noShowRate: number
    cancellationRate: number
    rescheduleRate: number
    peakHours: {
        hour: number
        appointmentCount: number
    }[]
    busyDays: {
        dayOfWeek: string
        appointmentCount: number
    }[]
}

interface RetentionMetrics {
    newPatients: number
    returningPatients: number
    retentionRate: number
    churnRate: number
    averageTimeBetweenVisits: number
    patientLifetimeValue: number
    riskOfLeaving: {
        patientId: string
        patientName: string
        riskScore: number
        lastVisit: DateTime
        factors: string[]
    }[]
}

// TODO: This interface will be used for future satisfaction scoring features
// interface SatisfactionScoring {
//     overallSatisfaction: number
//     categoryScores: {
//         category: string
//         score: number
//         responseCount: number
//     }[]
//     npsScore: number
//     satisfactionTrends: {
//         period: string
//         score: number
//         responseCount: number
//     }[]
//     topComplaints: {
//         issue: string
//         frequency: number
//         category: string
//     }[]
// }

interface PredictiveHealthAnalytics {
    highRiskPatients: {
        patientId: string
        patientName: string
        riskScore: number
        riskFactors: string[]
        recommendedActions: string[]
    }[]
    diseaseOutbreakPredictions: {
        disease: string
        predictedCases: number
        confidence: number
        peakPeriod: string
        affectedRegions: string[]
    }[]
    resourceDemandForecast: {
        resource: string
        period: string
        predictedDemand: number
        currentCapacity: number
        recommendation: string
    }[]
}

export default class PatientAnalyticsService {
    /**
     * Generate comprehensive demographic analysis
     */
    async generateDemographicAnalysis(dateRange?: { start: DateTime, end: DateTime }): Promise<DemographicAnalysis> {
        let query = Patient.query().whereNull('deleted_at')

        if (dateRange) {
            query = query.whereBetween('created_at', [dateRange.start.toJSDate(), dateRange.end.toJSDate()])
        }

        const patients = await query.exec()
        const totalPatients = patients.length

        // Age distribution
        const ageGroups = { '0-17': 0, '18-34': 0, '35-54': 0, '55-74': 0, '75+': 0 }
        const genderCounts = { male: 0, female: 0, other: 0 }
        const regionCounts: Record<string, number> = {}

        for (const patient of patients) {
            // Age calculation
            const age = DateTime.now().diff(patient.dateOfBirth, 'years').years
            if (age < 18) ageGroups['0-17']++
            else if (age < 35) ageGroups['18-34']++
            else if (age < 55) ageGroups['35-54']++
            else if (age < 75) ageGroups['55-74']++
            else ageGroups['75+']++

            // Gender distribution
            const gender = patient.gender.toLowerCase() as keyof typeof genderCounts
            if (genderCounts[gender] !== undefined) {
                genderCounts[gender]++
            } else {
                genderCounts.other++
            }

            // Geographic distribution (extract from address)
            const region = this.extractRegionFromAddress(patient.address)
            regionCounts[region] = (regionCounts[region] || 0) + 1
        }

        // Convert to analysis format
        const ageDistribution = Object.entries(ageGroups).map(([ageGroup, count]) => ({
            ageGroup,
            count,
            percentage: (count / totalPatients) * 100
        }))

        const genderDistribution = Object.entries(genderCounts).map(([gender, count]) => ({
            gender,
            count,
            percentage: (count / totalPatients) * 100
        }))

        const geographicDistribution = Object.entries(regionCounts).map(([region, count]) => ({
            region,
            count,
            percentage: (count / totalPatients) * 100
        }))

        // Insurance distribution (mock data - would be calculated from actual insurance records)
        const insuranceDistribution = [
            { type: 'Private', count: Math.round(totalPatients * 0.6), percentage: 60 },
            { type: 'Medicare', count: Math.round(totalPatients * 0.25), percentage: 25 },
            { type: 'Medicaid', count: Math.round(totalPatients * 0.1), percentage: 10 },
            { type: 'Uninsured', count: Math.round(totalPatients * 0.05), percentage: 5 }
        ]

        return {
            totalPatients,
            ageDistribution,
            genderDistribution,
            geographicDistribution,
            insuranceDistribution
        }
    }

    /**
     * Analyze disease prevalence across patient population
     */
    async analyzeDiseasePrevalence(condition?: string): Promise<DiseasePrevalenceReport[]> {
        // Get all patients with their conditions
        const patients = await Patient.query()
            .whereNull('deleted_at')
            .preload('allergyRecords')
            .preload('currentMedications')

        const conditionCounts: Record<string, { total: number, byAge: Record<string, number>, byGender: Record<string, number> }> = {}

        for (const patient of patients) {
            const age = DateTime.now().diff(patient.dateOfBirth, 'years').years
            const ageGroup = this.getAgeGroup(age)
            const gender = patient.gender.toLowerCase()

            // Extract conditions from chronic conditions
            for (const chronicCondition of patient.chronicConditions || []) {
                if (!conditionCounts[chronicCondition]) {
                    conditionCounts[chronicCondition] = {
                        total: 0,
                        byAge: {},
                        byGender: {}
                    }
                }

                conditionCounts[chronicCondition].total++
                conditionCounts[chronicCondition].byAge[ageGroup] = (conditionCounts[chronicCondition].byAge[ageGroup] || 0) + 1
                conditionCounts[chronicCondition].byGender[gender] = (conditionCounts[chronicCondition].byGender[gender] || 0) + 1
            }

            // Infer conditions from medications
            for (const medication of patient.currentMedications || []) {
                const inferredConditions = this.inferConditionsFromMedication(medication.medicationName)
                for (const inferredCondition of inferredConditions) {
                    if (!conditionCounts[inferredCondition]) {
                        conditionCounts[inferredCondition] = {
                            total: 0,
                            byAge: {},
                            byGender: {}
                        }
                    }

                    conditionCounts[inferredCondition].total++
                    conditionCounts[inferredCondition].byAge[ageGroup] = (conditionCounts[inferredCondition].byAge[ageGroup] || 0) + 1
                    conditionCounts[inferredCondition].byGender[gender] = (conditionCounts[inferredCondition].byGender[gender] || 0) + 1
                }
            }
        }

        const totalPatients = patients.length
        const reports: DiseasePrevalenceReport[] = []

        for (const [conditionName, data] of Object.entries(conditionCounts)) {
            if (condition && conditionName.toLowerCase() !== condition.toLowerCase()) {
                continue
            }

            const ageDistribution = Object.entries(data.byAge).map(([ageGroup, cases]) => ({
                ageGroup,
                cases,
                rate: (cases / totalPatients) * 100
            }))

            const genderDistribution = Object.entries(data.byGender).map(([genderName, cases]) => ({
                gender: genderName,
                cases,
                rate: (cases / totalPatients) * 100
            }))

            // Mock trend data (in real implementation, you'd query historical data)
            const trend = [
                { period: '2023-Q1', cases: Math.round(data.total * 0.8), change: -5.2 },
                { period: '2023-Q2', cases: Math.round(data.total * 0.9), change: 12.5 },
                { period: '2023-Q3', cases: Math.round(data.total * 0.95), change: 5.6 },
                { period: '2023-Q4', cases: data.total, change: 5.3 }
            ]

            reports.push({
                condition: conditionName,
                totalCases: data.total,
                prevalenceRate: (data.total / totalPatients) * 100,
                ageDistribution,
                genderDistribution,
                trend
            })
        }

        return reports.sort((a, b) => b.totalCases - a.totalCases)
    }

    /**
     * Analyze patient flow and appointment patterns
     */
    async analyzePatientFlow(dateRange: { start: DateTime, end: DateTime }): Promise<PatientFlowAnalysis> {
        const appointments = await Appointment.query()
            .whereBetween('appointment_date', [dateRange.start.toJSDate(), dateRange.end.toJSDate()])
            .preload('patient')

        const totalAppointments = appointments.length
        const appointmentTypes: Record<string, { count: number, totalDuration: number }> = {}
        const hourCounts: Record<number, number> = {}
        const dayCounts: Record<string, number> = {}
        let noShows = 0
        let cancellations = 0
        let reschedules = 0

        for (const appointment of appointments) {
            // Appointment types - using notes as type indicator for now
            const type = appointment.notes || 'general'
            if (!appointmentTypes[type]) {
                appointmentTypes[type] = { count: 0, totalDuration: 0 }
            }
            appointmentTypes[type].count++
            appointmentTypes[type].totalDuration += 30 // Default 30 minutes

            // Peak hours
            const hour = appointment.appointmentDate.hour
            hourCounts[hour] = (hourCounts[hour] || 0) + 1

            // Busy days
            const dayOfWeek = appointment.appointmentDate.toFormat('cccc') // 'Monday', 'Tuesday', etc.
            dayCounts[dayOfWeek] = (dayCounts[dayOfWeek] || 0) + 1

            // Status counts (mock data)
            const status = appointment.status || 'completed'
            if (status === 'no-show') noShows++
            if (status === 'cancelled') cancellations++
            if (status === 'rescheduled') reschedules++
        }

        return {
            totalAppointments,
            averageWaitTime: 15, // Mock data
            appointmentTypes: Object.entries(appointmentTypes).map(([type, data]) => ({
                type,
                count: data.count,
                averageDuration: data.totalDuration / data.count
            })),
            noShowRate: (noShows / totalAppointments) * 100,
            cancellationRate: (cancellations / totalAppointments) * 100,
            rescheduleRate: (reschedules / totalAppointments) * 100,
            peakHours: Object.entries(hourCounts).map(([hour, count]) => ({
                hour: parseInt(hour),
                appointmentCount: count
            })).sort((a, b) => b.appointmentCount - a.appointmentCount),
            busyDays: Object.entries(dayCounts).map(([dayOfWeek, count]) => ({
                dayOfWeek,
                appointmentCount: count
            })).sort((a, b) => b.appointmentCount - a.appointmentCount)
        }
    }

    /**
     * Calculate patient retention metrics
     */
    async calculateRetentionMetrics(period: { start: DateTime, end: DateTime }): Promise<RetentionMetrics> {
        const patients = await Patient.query()
            .whereNull('deleted_at')
            .preload('appointments')

        const periodStart = period.start
        const periodEnd = period.end

        let newPatients = 0
        let returningPatients = 0
        const riskPatients: RetentionMetrics['riskOfLeaving'] = []

        for (const patient of patients) {
            const createdAt = patient.createdAt
            const appointments = patient.appointments

            // Check if patient is new in this period
            if (createdAt >= periodStart && createdAt <= periodEnd) {
                newPatients++
            } else {
                // Check if they had appointments in this period
                const hasAppointmentInPeriod = appointments.some(apt => {
                    const aptDate = apt.appointmentDate // already a DateTime object
                    return aptDate >= periodStart && aptDate <= periodEnd
                })

                if (hasAppointmentInPeriod) {
                    returningPatients++
                }
            }

            // Risk assessment
            if (appointments.length > 0) {
                const lastAppointment = appointments.sort((a, b) =>
                    b.appointmentDate.toMillis() - a.appointmentDate.toMillis()
                )[0]

                const lastVisit = lastAppointment.appointmentDate // already a DateTime object
                const daysSinceLastVisit = DateTime.now().diff(lastVisit, 'days').days

                if (daysSinceLastVisit > 365) { // More than a year
                    const riskFactors = []
                    if (daysSinceLastVisit > 365) riskFactors.push('Long absence')
                    if (appointments.length < 3) riskFactors.push('Low engagement')

                    const riskScore = Math.min(daysSinceLastVisit / 365, 1.0)

                    riskPatients.push({
                        patientId: patient.id,
                        patientName: patient.name,
                        riskScore,
                        lastVisit,
                        factors: riskFactors
                    })
                }
            }
        }

        const totalActivePatients = newPatients + returningPatients
        const retentionRate = totalActivePatients > 0 ? (returningPatients / totalActivePatients) * 100 : 0
        const churnRate = 100 - retentionRate

        return {
            newPatients,
            returningPatients,
            retentionRate,
            churnRate,
            averageTimeBetweenVisits: 90, // Mock data - days
            patientLifetimeValue: 2500, // Mock data - dollars
            riskOfLeaving: riskPatients.sort((a, b) => b.riskScore - a.riskScore).slice(0, 20)
        }
    }

    /**
     * Generate predictive health analytics
     */
    async generatePredictiveAnalytics(): Promise<PredictiveHealthAnalytics> {
        const patients = await Patient.query()
            .whereNull('deleted_at')
            .preload('allergyRecords')
            .preload('currentMedications')
            .preload('demographics')

        const highRiskPatients: PredictiveHealthAnalytics['highRiskPatients'] = []

        for (const patient of patients) {
            const riskFactors: string[] = []
            let riskScore = 0

            // Age risk
            const age = DateTime.now().diff(patient.dateOfBirth, 'years').years
            if (age > 65) {
                riskFactors.push('Advanced age')
                riskScore += 0.3
            }

            // Chronic conditions
            if (patient.chronicConditions && patient.chronicConditions.length > 0) {
                riskFactors.push('Multiple chronic conditions')
                riskScore += patient.chronicConditions.length * 0.1
            }

            // Medication complexity
            if (patient.currentMedications && patient.currentMedications.length > 5) {
                riskFactors.push('Polypharmacy')
                riskScore += 0.2
            }

            // Severe allergies
            const severeAllergies = patient.allergyRecords?.filter(a =>
                a.severity === 'severe' || a.severity === 'life-threatening'
            ) || []
            if (severeAllergies.length > 0) {
                riskFactors.push('Severe allergies')
                riskScore += 0.15
            }

            if (riskScore > 0.5) {
                const recommendedActions = this.generateRecommendedActions(riskFactors, patient)

                highRiskPatients.push({
                    patientId: patient.id,
                    patientName: patient.name,
                    riskScore: Math.min(riskScore, 1.0),
                    riskFactors,
                    recommendedActions
                })
            }
        }

        // Mock outbreak predictions
        const diseaseOutbreakPredictions = [
            {
                disease: 'Influenza',
                predictedCases: 150,
                confidence: 0.85,
                peakPeriod: 'January 2024',
                affectedRegions: ['Downtown', 'Suburbs']
            },
            {
                disease: 'COVID-19 Variant',
                predictedCases: 75,
                confidence: 0.65,
                peakPeriod: 'March 2024',
                affectedRegions: ['University Area']
            }
        ]

        // Mock resource demand forecast
        const resourceDemandForecast = [
            {
                resource: 'ICU Beds',
                period: 'Next 30 days',
                predictedDemand: 25,
                currentCapacity: 30,
                recommendation: 'Capacity adequate'
            },
            {
                resource: 'Nursing Staff',
                period: 'Next 90 days',
                predictedDemand: 120,
                currentCapacity: 100,
                recommendation: 'Consider hiring additional staff'
            }
        ]

        return {
            highRiskPatients: highRiskPatients.sort((a, b) => b.riskScore - a.riskScore),
            diseaseOutbreakPredictions,
            resourceDemandForecast
        }
    }

    // Helper methods
    private extractRegionFromAddress(address: string): string {
        // Simple region extraction - in real implementation, use geocoding services
        const regions = ['Downtown', 'Suburbs', 'North Side', 'South Side', 'East End', 'West End']
        const lowerAddress = address.toLowerCase()

        for (const region of regions) {
            if (lowerAddress.includes(region.toLowerCase())) {
                return region
            }
        }

        return 'Other'
    }

    private getAgeGroup(age: number): string {
        if (age < 18) return '0-17'
        if (age < 35) return '18-34'
        if (age < 55) return '35-54'
        if (age < 75) return '55-74'
        return '75+'
    }

    private inferConditionsFromMedication(medicationName: string): string[] {
        const conditions: string[] = []
        const medLower = medicationName.toLowerCase()

        if (medLower.includes('insulin') || medLower.includes('metformin')) {
            conditions.push('Diabetes')
        }
        if (medLower.includes('lisinopril') || medLower.includes('atenolol')) {
            conditions.push('Hypertension')
        }
        if (medLower.includes('statin') || medLower.includes('lipitor')) {
            conditions.push('High Cholesterol')
        }
        if (medLower.includes('albuterol') || medLower.includes('inhaler')) {
            conditions.push('Asthma/COPD')
        }

        return conditions
    }

    private generateRecommendedActions(riskFactors: string[], _patient: any): string[] {
        const actions: string[] = []

        if (riskFactors.includes('Advanced age')) {
            actions.push('Schedule annual wellness visit')
            actions.push('Review fall prevention measures')
        }

        if (riskFactors.includes('Multiple chronic conditions')) {
            actions.push('Coordinate care with specialists')
            actions.push('Medication reconciliation')
        }

        if (riskFactors.includes('Polypharmacy')) {
            actions.push('Pharmacist consultation for medication review')
            actions.push('Check for drug interactions')
        }

        if (riskFactors.includes('Severe allergies')) {
            actions.push('Ensure emergency action plan is current')
            actions.push('Review allergy alert protocols')
        }

        actions.push('Consider case management enrollment')

        return actions
    }
}
