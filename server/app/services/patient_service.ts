import { DateTime } from 'luxon'
import Patient from '#models/patient'
import PatientDemographics from '#models/patient_demographics'
import PatientInsurance from '#models/patient_insurance'
import PatientAllergy from '#models/patient_allergy'
import PatientMedication from '#models/patient_medication'
import PatientImmunization from '#models/patient_immunization'
import PatientFamilyHistory from '#models/patient_family_history'
import PatientDocument from '#models/patient_document'
import PatientConsent from '#models/patient_consent'
import PatientPortalAccess from '#models/patient_portal_access'
import PatientCommunicationPreferences from '#models/patient_communication_preferences'
import Database from '@adonisjs/lucid/services/db'

interface CompletePatientProfile {
    // Basic patient data
    patient: {
        name: string
        phone: string
        email?: string
        dateOfBirth: string
        gender: string
        address: string
        bloodGroup?: string
        emergencyContact?: object
        allergies?: string[]
        chronicConditions?: string[]
        vaccinationRecords?: object[]
        insuranceInfo?: object
    }

    // Extended data
    demographics?: Partial<PatientDemographics>
    insurances?: Partial<PatientInsurance>[]
    allergyRecords?: Partial<PatientAllergy>[]
    medications?: Partial<PatientMedication>[]
    immunizations?: Partial<PatientImmunization>[]
    familyHistory?: Partial<PatientFamilyHistory>[]
    documents?: Partial<PatientDocument>[]
    consents?: Partial<PatientConsent>[]
    portalAccess?: Partial<PatientPortalAccess>
    communicationPreferences?: Partial<PatientCommunicationPreferences>
}

interface DuplicateCheckResult {
    isDuplicate: boolean
    matches: Array<{
        patient: Patient
        score: number
        matchingFields: string[]
    }>
    confidence: number
}

export default class PatientService {
    /**
     * Create a complete patient profile with all related data
     */
    async createCompleteProfile(data: CompletePatientProfile): Promise<Patient> {
        return Database.transaction(async (trx) => {
            // Generate unique patient ID
            const patientId = await this.generateUniquePatientId()

            // Create main patient record
            const patient = new Patient()
            patient.useTransaction(trx)
            patient.patientId = patientId
            patient.name = data.patient.name
            patient.phone = data.patient.phone
            patient.email = data.patient.email || null
            patient.dateOfBirth = DateTime.fromISO(data.patient.dateOfBirth)
            patient.gender = data.patient.gender
            patient.address = data.patient.address
            patient.bloodGroup = data.patient.bloodGroup || null
            patient.emergencyContact = data.patient.emergencyContact || {}
            patient.allergies = data.patient.allergies || []
            patient.chronicConditions = data.patient.chronicConditions || []
            patient.vaccinationRecords = data.patient.vaccinationRecords || []
            patient.insuranceInfo = data.patient.insuranceInfo || {}

            await patient.save()

            // Create demographics if provided
            if (data.demographics) {
                await this.createDemographics(patient.id, data.demographics, trx)
            }

            // Create insurances if provided
            if (data.insurances && data.insurances.length > 0) {
                await this.createInsurances(patient.id, data.insurances, trx)
            }

            // Create allergy records if provided
            if (data.allergyRecords && data.allergyRecords.length > 0) {
                await this.createAllergyRecords(patient.id, data.allergyRecords, trx)
            }

            // Create medications if provided
            if (data.medications && data.medications.length > 0) {
                await this.createMedications(patient.id, data.medications, trx)
            }

            // Create immunizations if provided
            if (data.immunizations && data.immunizations.length > 0) {
                await this.createImmunizations(patient.id, data.immunizations, trx)
            }

            // Create family history if provided
            if (data.familyHistory && data.familyHistory.length > 0) {
                await this.createFamilyHistory(patient.id, data.familyHistory, trx)
            }

            // Create consents if provided
            if (data.consents && data.consents.length > 0) {
                await this.createConsents(patient.id, data.consents, trx)
            }

            // Create portal access if provided
            if (data.portalAccess) {
                await this.createPortalAccess(patient.id, data.portalAccess, trx)
            }

            // Create communication preferences if provided
            if (data.communicationPreferences) {
                await this.createCommunicationPreferences(patient.id, data.communicationPreferences, trx)
            }

            return patient
        })
    }

    /**
     * Update medical history (allergies, medications, immunizations)
     */
    async updateMedicalHistory(patientId: string, medicalData: {
        allergies?: Partial<PatientAllergy>[]
        medications?: Partial<PatientMedication>[]
        immunizations?: Partial<PatientImmunization>[]
        familyHistory?: Partial<PatientFamilyHistory>[]
    }): Promise<void> {
        return Database.transaction(async (trx) => {
            if (medicalData.allergies) {
                // Remove existing allergies and add new ones
                await PatientAllergy.query({ client: trx })
                    .where('patient_id', patientId)
                    .delete()
                await this.createAllergyRecords(patientId, medicalData.allergies, trx)
            }

            if (medicalData.medications) {
                // Update medications (mark as discontinued and add new ones)
                await PatientMedication.query({ client: trx })
                    .where('patient_id', patientId)
                    .where('status', 'active')
                    .update({ status: 'discontinued' })
                await this.createMedications(patientId, medicalData.medications, trx)
            }

            if (medicalData.immunizations) {
                await this.createImmunizations(patientId, medicalData.immunizations, trx)
            }

            if (medicalData.familyHistory) {
                await PatientFamilyHistory.query({ client: trx })
                    .where('patient_id', patientId)
                    .delete()
                await this.createFamilyHistory(patientId, medicalData.familyHistory, trx)
            }
        })
    }

    /**
     * Manage insurance information
     */
    async manageInsurance(patientId: string, insuranceData: Partial<PatientInsurance>[]): Promise<PatientInsurance[]> {
        return Database.transaction(async (trx) => {
            // Remove existing insurances
            await PatientInsurance.query({ client: trx })
                .where('patient_id', patientId)
                .delete()

            // Create new insurances
            return this.createInsurances(patientId, insuranceData, trx)
        })
    }

    /**
     * Calculate patient age with precision
     */
    calculateAge(dateOfBirth: string | DateTime): {
        years: number
        months: number
        days: number
        exact: string
    } {
        const birthDate = typeof dateOfBirth === 'string'
            ? DateTime.fromISO(dateOfBirth)
            : dateOfBirth
        const now = DateTime.now()

        const diff = now.diff(birthDate, ['years', 'months', 'days']).toObject()

        return {
            years: Math.floor(diff.years || 0),
            months: Math.floor(diff.months || 0),
            days: Math.floor(diff.days || 0),
            exact: `${Math.floor(diff.years || 0)} years, ${Math.floor(diff.months || 0)} months, ${Math.floor(diff.days || 0)} days`
        }
    }

    /**
     * Intelligent duplicate detection
     */
    async checkDuplicates(patientData: {
        name: string
        phone: string
        email?: string
        dateOfBirth: string
    }): Promise<DuplicateCheckResult> {
        const potentialDuplicates = await Patient.query()
            .whereNull('deleted_at')
            .where((query) => {
                query
                    .where('name', 'ILIKE', `%${patientData.name}%`)
                    .orWhere('phone', patientData.phone)
                    .orWhere('email', patientData.email || '')
            })
            .exec()

        const matches = potentialDuplicates.map((patient) => {
            const score = this.calculateSimilarityScore(patientData, patient)
            const matchingFields = this.getMatchingFields(patientData, patient)

            return {
                patient,
                score,
                matchingFields
            }
        }).filter(match => match.score > 0.3) // Only return matches with >30% similarity

        const isDuplicate = matches.some(match => match.score > 0.8)
        const confidence = matches.length > 0 ? Math.max(...matches.map(m => m.score)) : 0

        return {
            isDuplicate,
            matches: matches.sort((a, b) => b.score - a.score),
            confidence
        }
    }

    /**
     * Merge duplicate patient records
     */
    async mergePatients(primaryPatientId: string, duplicatePatientIds: string[]): Promise<Patient> {
        return Database.transaction(async (trx) => {
            const primaryPatient = await Patient.findOrFail(primaryPatientId)

            for (const duplicateId of duplicatePatientIds) {
                // Transfer all related records to primary patient
                await this.transferRelatedRecords(duplicateId, primaryPatientId, trx)

                // Soft delete the duplicate
                await Patient.query({ client: trx })
                    .where('id', duplicateId)
                    .update({ deletedAt: DateTime.now() })
            }

            return primaryPatient
        })
    }

    /**
     * Generate a unique patient ID
     */
    private async generateUniquePatientId(): Promise<string> {
        let patientId: string
        let isUnique = false

        while (!isUnique) {
            // Generate patient ID in format: P + YYYYMMDD + 4-digit sequence
            const today = DateTime.now()
            const dateStr = today.toFormat('yyyyMMdd')
            const sequence = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
            patientId = `P${dateStr}${sequence}`

            // Check if this ID already exists
            const existing = await Patient.query()
                .where('patient_id', patientId)
                .first()

            isUnique = !existing
        }

        return patientId!
    }

    /**
     * Calculate similarity score between patient data
     */
    private calculateSimilarityScore(data1: any, data2: Patient): number {
        let score = 0
        let totalFields = 0

        // Name similarity (weighted heavily)
        if (data1.name && data2.name) {
            const nameScore = this.calculateStringsimilarity(data1.name.toLowerCase(), data2.name.toLowerCase())
            score += nameScore * 0.4
            totalFields += 0.4
        }

        // Exact phone match
        if (data1.phone === data2.phone) {
            score += 0.3
        }
        totalFields += 0.3

        // Exact email match
        if (data1.email && data2.email && data1.email === data2.email) {
            score += 0.2
        }
        totalFields += 0.2

        // Date of birth match
        if (data1.dateOfBirth === data2.dateOfBirth.toFormat('yyyy-MM-dd')) {
            score += 0.1
        }
        totalFields += 0.1

        return totalFields > 0 ? score / totalFields : 0
    }

    /**
     * Calculate string similarity using Levenshtein distance
     */
    private calculateStringsimilarity(str1: string, str2: string): number {
        const distance = this.levenshteinDistance(str1, str2)
        const maxLength = Math.max(str1.length, str2.length)
        return maxLength === 0 ? 1 : 1 - (distance / maxLength)
    }

    /**
     * Calculate Levenshtein distance between two strings
     */
    private levenshteinDistance(str1: string, str2: string): number {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))

        for (let i = 0; i <= str1.length; i++) {
            matrix[0][i] = i
        }

        for (let j = 0; j <= str2.length; j++) {
            matrix[j][0] = j
        }

        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1, // deletion
                    matrix[j - 1][i] + 1, // insertion
                    matrix[j - 1][i - 1] + indicator // substitution
                )
            }
        }

        return matrix[str2.length][str1.length]
    }

    /**
     * Get matching fields between patient data
     */
    private getMatchingFields(data1: any, data2: Patient): string[] {
        const matching: string[] = []

        if (data1.name && data2.name &&
            this.calculateStringsimilarity(data1.name.toLowerCase(), data2.name.toLowerCase()) > 0.8) {
            matching.push('name')
        }

        if (data1.phone === data2.phone) {
            matching.push('phone')
        }

        if (data1.email && data2.email && data1.email === data2.email) {
            matching.push('email')
        }

        if (data1.dateOfBirth === data2.dateOfBirth.toFormat('yyyy-MM-dd')) {
            matching.push('dateOfBirth')
        }

        return matching
    }

    // Helper methods for creating related records
    private async createDemographics(patientId: string, data: Partial<PatientDemographics>, trx: any): Promise<PatientDemographics> {
        const demographics = new PatientDemographics()
        demographics.useTransaction(trx)
        demographics.patientId = patientId
        Object.assign(demographics, data)
        await demographics.save()
        return demographics
    }

    private async createInsurances(patientId: string, insurances: Partial<PatientInsurance>[], trx: any): Promise<PatientInsurance[]> {
        const created: PatientInsurance[] = []

        for (const insuranceData of insurances) {
            const insurance = new PatientInsurance()
            insurance.useTransaction(trx)
            insurance.patientId = patientId
            Object.assign(insurance, insuranceData)
            await insurance.save()
            created.push(insurance)
        }

        return created
    }

    private async createAllergyRecords(patientId: string, allergies: Partial<PatientAllergy>[], trx: any): Promise<PatientAllergy[]> {
        const created: PatientAllergy[] = []

        for (const allergyData of allergies) {
            const allergy = new PatientAllergy()
            allergy.useTransaction(trx)
            allergy.patientId = patientId
            Object.assign(allergy, allergyData)
            await allergy.save()
            created.push(allergy)
        }

        return created
    }

    private async createMedications(patientId: string, medications: Partial<PatientMedication>[], trx: any): Promise<PatientMedication[]> {
        const created: PatientMedication[] = []

        for (const medicationData of medications) {
            const medication = new PatientMedication()
            medication.useTransaction(trx)
            medication.patientId = patientId
            Object.assign(medication, medicationData)
            await medication.save()
            created.push(medication)
        }

        return created
    }

    private async createImmunizations(patientId: string, immunizations: Partial<PatientImmunization>[], trx: any): Promise<PatientImmunization[]> {
        const created: PatientImmunization[] = []

        for (const immunizationData of immunizations) {
            const immunization = new PatientImmunization()
            immunization.useTransaction(trx)
            immunization.patientId = patientId
            Object.assign(immunization, immunizationData)
            await immunization.save()
            created.push(immunization)
        }

        return created
    }

    private async createFamilyHistory(patientId: string, familyHistory: Partial<PatientFamilyHistory>[], trx: any): Promise<PatientFamilyHistory[]> {
        const created: PatientFamilyHistory[] = []

        for (const historyData of familyHistory) {
            const history = new PatientFamilyHistory()
            history.useTransaction(trx)
            history.patientId = patientId
            Object.assign(history, historyData)
            await history.save()
            created.push(history)
        }

        return created
    }

    private async createConsents(patientId: string, consents: Partial<PatientConsent>[], trx: any): Promise<PatientConsent[]> {
        const created: PatientConsent[] = []

        for (const consentData of consents) {
            const consent = new PatientConsent()
            consent.useTransaction(trx)
            consent.patientId = patientId
            Object.assign(consent, consentData)
            await consent.save()
            created.push(consent)
        }

        return created
    }

    private async createPortalAccess(patientId: string, data: Partial<PatientPortalAccess>, trx: any): Promise<PatientPortalAccess> {
        const portalAccess = new PatientPortalAccess()
        portalAccess.useTransaction(trx)
        portalAccess.patientId = patientId
        Object.assign(portalAccess, data)
        await portalAccess.save()
        return portalAccess
    }

    private async createCommunicationPreferences(patientId: string, data: Partial<PatientCommunicationPreferences>, trx: any): Promise<PatientCommunicationPreferences> {
        const preferences = new PatientCommunicationPreferences()
        preferences.useTransaction(trx)
        preferences.patientId = patientId
        Object.assign(preferences, data)
        await preferences.save()
        return preferences
    }

    private async transferRelatedRecords(fromPatientId: string, toPatientId: string, trx: any): Promise<void> {
        // Transfer all related records from duplicate to primary patient
        const updateQueries = [
            PatientDemographics.query({ client: trx }).where('patient_id', fromPatientId).update({ patientId: toPatientId }),
            PatientInsurance.query({ client: trx }).where('patient_id', fromPatientId).update({ patientId: toPatientId }),
            PatientAllergy.query({ client: trx }).where('patient_id', fromPatientId).update({ patientId: toPatientId }),
            PatientMedication.query({ client: trx }).where('patient_id', fromPatientId).update({ patientId: toPatientId }),
            PatientImmunization.query({ client: trx }).where('patient_id', fromPatientId).update({ patientId: toPatientId }),
            PatientFamilyHistory.query({ client: trx }).where('patient_id', fromPatientId).update({ patientId: toPatientId }),
            PatientDocument.query({ client: trx }).where('patient_id', fromPatientId).update({ patientId: toPatientId }),
            PatientConsent.query({ client: trx }).where('patient_id', fromPatientId).update({ patientId: toPatientId }),
            PatientPortalAccess.query({ client: trx }).where('patient_id', fromPatientId).update({ patientId: toPatientId }),
            PatientCommunicationPreferences.query({ client: trx }).where('patient_id', fromPatientId).update({ patientId: toPatientId })
        ]

        await Promise.all(updateQueries)
    }
}
