import MedicalRecord from '#models/medical_record'
import { DateTime } from 'luxon'

export interface VitalSignsRanges {
    temperature: { min: number; max: number; critical: { min: number; max: number } }
    heartRate: { min: number; max: number; critical: { min: number; max: number } }
    respiratoryRate: { min: number; max: number; critical: { min: number; max: number } }
    oxygenSaturation: { min: number; max: number; critical: { min: number; max: number } }
    bloodPressure: {
        systolic: { min: number; max: number; critical: { min: number; max: number } }
        diastolic: { min: number; max: number; critical: { min: number; max: number } }
    }
}

export interface MedicalAlert {
    type: 'critical' | 'warning' | 'info'
    message: string
    field: string
    value: any
    recommendedAction?: string
}

export class MedicalDataService {
    /**
     * Standard vital signs ranges for adults
     */
    private static vitalSignsRanges: VitalSignsRanges = {
        temperature: {
            min: 36.1,
            max: 37.2,
            critical: { min: 35, max: 39 }
        },
        heartRate: {
            min: 60,
            max: 100,
            critical: { min: 40, max: 120 }
        },
        respiratoryRate: {
            min: 12,
            max: 20,
            critical: { min: 8, max: 30 }
        },
        oxygenSaturation: {
            min: 95,
            max: 100,
            critical: { min: 90, max: 100 }
        },
        bloodPressure: {
            systolic: {
                min: 90,
                max: 140,
                critical: { min: 70, max: 180 }
            },
            diastolic: {
                min: 60,
                max: 90,
                critical: { min: 40, max: 110 }
            }
        }
    }

    /**
     * Validate vital signs and return alerts
     */
    static validateVitalSigns(vitalSigns: Record<string, any>): MedicalAlert[] {
        const alerts: MedicalAlert[] = []

        for (const [field, value] of Object.entries(vitalSigns)) {
            if (field === 'bloodPressure' && typeof value === 'object') {
                const systolic = value.systolic
                const diastolic = value.diastolic

                if (systolic && this.vitalSignsRanges.bloodPressure.systolic) {
                    const systolicAlert = this.checkVitalRange(
                        'bloodPressure.systolic',
                        systolic,
                        this.vitalSignsRanges.bloodPressure.systolic
                    )
                    if (systolicAlert) alerts.push(systolicAlert)
                }

                if (diastolic && this.vitalSignsRanges.bloodPressure.diastolic) {
                    const diastolicAlert = this.checkVitalRange(
                        'bloodPressure.diastolic',
                        diastolic,
                        this.vitalSignsRanges.bloodPressure.diastolic
                    )
                    if (diastolicAlert) alerts.push(diastolicAlert)
                }
            } else if (field in this.vitalSignsRanges && typeof value === 'number') {
                const range = this.vitalSignsRanges[field as keyof VitalSignsRanges] as any
                const alert = this.checkVitalRange(field, value, range)
                if (alert) alerts.push(alert)
            }
        }

        return alerts
    }

    /**
     * Check if a vital sign value is within normal range
     */
    private static checkVitalRange(
        field: string,
        value: number,
        range: { min: number; max: number; critical: { min: number; max: number } }
    ): MedicalAlert | null {
        if (value < range.critical.min || value > range.critical.max) {
            return {
                type: 'critical',
                field,
                value,
                message: `Critical ${field}: ${value} (Normal: ${range.min}-${range.max})`,
                recommendedAction: 'Immediate medical attention required'
            }
        } else if (value < range.min || value > range.max) {
            return {
                type: 'warning',
                field,
                value,
                message: `Abnormal ${field}: ${value} (Normal: ${range.min}-${range.max})`,
                recommendedAction: 'Monitor closely and consider follow-up'
            }
        }

        return null
    }

    /**
     * Calculate medical record statistics for a patient
     */
    static async calculatePatientStatistics(patientId: string) {
        const medicalRecords = await MedicalRecord.query()
            .where('patient_id', patientId)
            .orderBy('visit_date', 'desc')

        const thirtyDaysAgo = DateTime.now().minus({ days: 30 })
        const sixMonthsAgo = DateTime.now().minus({ months: 6 })

        const stats = {
            totalRecords: medicalRecords.length,
            recentRecords: medicalRecords.filter(r => r.visitDate >= thirtyDaysAgo).length,
            recordsLastSixMonths: medicalRecords.filter(r => r.visitDate >= sixMonthsAgo).length,
            withMedications: medicalRecords.filter(r => r.medications && r.medications.length > 0).length,
            withLabResults: medicalRecords.filter(r => r.labResults && r.labResults.length > 0).length,
            withVitalSigns: medicalRecords.filter(r =>
                r.vitalSigns && Object.keys(r.vitalSigns).length > 0
            ).length,
            withFollowUps: medicalRecords.filter(r =>
                r.followUpInstructions && r.followUpInstructions.length > 0
            ).length,
            withAttachments: medicalRecords.filter(r => r.attachments && r.attachments.length > 0).length,
            upcomingVisits: medicalRecords.filter(r =>
                r.nextVisitDate && r.nextVisitDate > DateTime.now()
            ).length,
            averageVisitsPerMonth: medicalRecords.length > 0 ?
                (medicalRecords.length / this.getMonthsBetween(medicalRecords[medicalRecords.length - 1].visitDate, DateTime.now())) : 0
        }

        return stats
    }

    /**
     * Generate medical alerts for a patient
     */
    static async generateMedicalAlerts(patientId: string): Promise<MedicalAlert[]> {
        const alerts: MedicalAlert[] = []

        const recentRecords = await MedicalRecord.query()
            .where('patient_id', patientId)
            .where('visit_date', '>=', DateTime.now().minus({ days: 30 }).toSQL())
            .orderBy('visit_date', 'desc')

        // Check for overdue follow-ups
        const overdueRecords = await MedicalRecord.query()
            .where('patient_id', patientId)
            .whereNotNull('next_visit_date')
            .where('next_visit_date', '<', DateTime.now().toSQL())

        if (overdueRecords.length > 0) {
            alerts.push({
                type: 'warning',
                field: 'follow_up',
                value: overdueRecords.length,
                message: `${overdueRecords.length} overdue follow-up visit(s)`,
                recommendedAction: 'Schedule follow-up appointments'
            })
        }

        // Check recent vital signs for abnormalities
        for (const record of recentRecords) {
            if (record.vitalSigns && Object.keys(record.vitalSigns).length > 0) {
                const vitalAlerts = this.validateVitalSigns(record.vitalSigns)
                alerts.push(...vitalAlerts)
            }
        }

        // Check for missing vital signs in recent visits
        const recentWithoutVitals = recentRecords.filter(r =>
            !r.vitalSigns || Object.keys(r.vitalSigns).length === 0
        )

        if (recentWithoutVitals.length > 0) {
            alerts.push({
                type: 'info',
                field: 'vital_signs',
                value: recentWithoutVitals.length,
                message: `${recentWithoutVitals.length} recent visit(s) without vital signs`,
                recommendedAction: 'Consider recording vital signs for comprehensive care'
            })
        }

        return alerts
    }

    /**
     * Get vital signs trends for a patient
     */
    static async getVitalSignsTrends(patientId: string, days: number = 90) {
        const fromDate = DateTime.now().minus({ days })

        const records = await MedicalRecord.query()
            .where('patient_id', patientId)
            .where('visit_date', '>=', fromDate.toSQL())
            .whereNotNull('vital_signs')
            .orderBy('visit_date', 'asc')

        const trends = records
            .filter(record => record.vitalSigns && Object.keys(record.vitalSigns).length > 0)
            .map(record => ({
                date: record.visitDate.toISODate(),
                recordId: record.recordId,
                vitalSigns: record.vitalSigns,
                alerts: this.validateVitalSigns(record.vitalSigns)
            }))

        return trends
    }

    /**
     * Validate medication interactions (basic implementation)
     */
    static checkMedicationInteractions(medications: any[]): MedicalAlert[] {
        const alerts: MedicalAlert[] = []

        // This is a simplified example - in production, you'd use a comprehensive drug interaction database
        const commonInteractions = [
            {
                drugs: ['warfarin', 'aspirin'],
                severity: 'critical',
                message: 'Increased risk of bleeding when taken together'
            },
            {
                drugs: ['digoxin', 'furosemide'],
                severity: 'warning',
                message: 'Monitor potassium levels closely'
            }
        ]

        const medicationNames = medications.map(med => med.name?.toLowerCase() || '')

        for (const interaction of commonInteractions) {
            const foundDrugs = interaction.drugs.filter(drug =>
                medicationNames.some(med => med.includes(drug))
            )

            if (foundDrugs.length >= 2) {
                alerts.push({
                    type: interaction.severity as 'critical' | 'warning',
                    field: 'medications',
                    value: foundDrugs,
                    message: `Drug interaction: ${foundDrugs.join(' + ')} - ${interaction.message}`,
                    recommendedAction: 'Consult pharmacist or physician'
                })
            }
        }

        return alerts
    }

    /**
     * Helper function to calculate months between dates
     */
    private static getMonthsBetween(startDate: DateTime, endDate: DateTime): number {
        const diff = endDate.diff(startDate, 'months')
        return Math.max(1, diff.months)
    }

    /**
     * Validate lab results and generate alerts
     */
    static validateLabResults(labResults: any[]): MedicalAlert[] {
        const alerts: MedicalAlert[] = []

        for (const result of labResults) {
            if (result.status === 'critical') {
                alerts.push({
                    type: 'critical',
                    field: 'lab_results',
                    value: result.result,
                    message: `Critical lab result: ${result.testName} = ${result.result} ${result.unit || ''}`,
                    recommendedAction: 'Immediate clinical review required'
                })
            } else if (result.status === 'high' || result.status === 'low') {
                alerts.push({
                    type: 'warning',
                    field: 'lab_results',
                    value: result.result,
                    message: `Abnormal lab result: ${result.testName} = ${result.result} ${result.unit || ''} (Normal: ${result.normalRange})`,
                    recommendedAction: 'Review and consider follow-up testing'
                })
            }
        }

        return alerts
    }
}

export default MedicalDataService
