import { DateTime } from 'luxon'
import PatientAllergy from '#models/patient_allergy'
import PatientMedication from '#models/patient_medication'
import PatientImmunization from '#models/patient_immunization'

interface AllergyInteraction {
    severity: 'mild' | 'moderate' | 'severe' | 'critical'
    description: string
    recommendations: string[]
}

interface MedicationInteraction {
    severity: 'minor' | 'moderate' | 'major' | 'contraindicated'
    description: string
    clinicalEffects: string[]
    management: string[]
}

interface ImmunizationSchedule {
    vaccine: string
    dueDate: DateTime
    isOverdue: boolean
    priority: 'routine' | 'recommended' | 'urgent'
    notes?: string
}

interface RiskScore {
    overall: number
    cardiovascular: number
    diabetes: number
    respiratory: number
    infectious: number
    factors: Array<{
        category: string
        factor: string
        impact: number
        weight: number
    }>
}

interface PreventiveCareReminder {
    type: 'screening' | 'vaccination' | 'checkup' | 'lifestyle'
    title: string
    description: string
    dueDate: DateTime
    priority: 'low' | 'medium' | 'high' | 'urgent'
    ageGroup: string
    guidelines: string[]
}

export default class ClinicalDataService {
    // Known drug allergies and their interactions
    private readonly DRUG_ALLERGY_INTERACTIONS: Record<string, { contraindicated: string[], caution: string[] }> = {
        'penicillin': {
            contraindicated: ['amoxicillin', 'ampicillin', 'penicillin v'],
            caution: ['cephalexin', 'cefuroxime']
        },
        'sulfa': {
            contraindicated: ['sulfamethoxazole', 'sulfasalazine'],
            caution: ['celecoxib', 'hydrochlorothiazide']
        },
        'aspirin': {
            contraindicated: ['aspirin', 'nsaids'],
            caution: ['ibuprofen', 'naproxen']
        }
    }

    // Known drug-drug interactions
    private readonly DRUG_INTERACTIONS: Record<string, { major: string[], moderate: string[] }> = {
        'warfarin': {
            major: ['aspirin', 'ibuprofen', 'naproxen'],
            moderate: ['acetaminophen', 'omeprazole']
        },
        'metformin': {
            major: ['furosemide'],
            moderate: ['lisinopril']
        }
    }

    // Standard immunization schedule
    private readonly IMMUNIZATION_SCHEDULE = {
        'annual': ['influenza'],
        'every_10_years': ['tetanus', 'diphtheria'],
        'age_based': {
            65: ['pneumococcal', 'zoster'],
            50: ['zoster_recombinant']
        }
    }

    /**
     * Check for allergy interactions with proposed medications
     */
    async checkAllergyInteractions(patientId: string, proposedMedications: string[]): Promise<AllergyInteraction[]> {
        const allergies = await PatientAllergy.query()
            .where('patient_id', patientId)
            .where('status', 'active')
            .where('allergy_type', 'drug')

        const interactions: AllergyInteraction[] = []

        for (const allergy of allergies) {
            const allergen = allergy.allergen.toLowerCase()

            for (const medication of proposedMedications) {
                const med = medication.toLowerCase()

                // Check direct contraindications
                if (this.DRUG_ALLERGY_INTERACTIONS[allergen]?.contraindicated?.includes(med)) {
                    interactions.push({
                        severity: allergy.severity === 'life-threatening' ? 'critical' : 'severe',
                        description: `Contraindicated: ${medication} due to ${allergy.allergen} allergy`,
                        recommendations: [
                            'Do not administer this medication',
                            'Consider alternative medications',
                            'Consult with physician for alternatives'
                        ]
                    })
                }

                // Check caution medications
                if (this.DRUG_ALLERGY_INTERACTIONS[allergen]?.caution?.includes(med)) {
                    interactions.push({
                        severity: 'moderate',
                        description: `Caution required: ${medication} with ${allergy.allergen} allergy`,
                        recommendations: [
                            'Monitor patient closely',
                            'Have emergency medications available',
                            'Consider skin testing before administration'
                        ]
                    })
                }
            }
        }

        return interactions
    }

    /**
     * Check for medication interactions
     */
    async checkMedicationInteractions(patientId: string, proposedMedication: string): Promise<MedicationInteraction[]> {
        const currentMedications = await PatientMedication.query()
            .where('patient_id', patientId)
            .where('status', 'active')

        const interactions: MedicationInteraction[] = []
        const proposed = proposedMedication.toLowerCase()

        for (const currentMed of currentMedications) {
            const current = currentMed.medicationName.toLowerCase()

            // Check for major interactions
            if (this.DRUG_INTERACTIONS[current]?.major?.includes(proposed) ||
                this.DRUG_INTERACTIONS[proposed]?.major?.includes(current)) {
                interactions.push({
                    severity: 'major',
                    description: `Major interaction between ${currentMed.medicationName} and ${proposedMedication}`,
                    clinicalEffects: [
                        'Increased risk of bleeding',
                        'Altered drug effectiveness',
                        'Serious adverse reactions possible'
                    ],
                    management: [
                        'Avoid combination if possible',
                        'Monitor closely if combination necessary',
                        'Consider dose adjustments',
                        'Regular laboratory monitoring'
                    ]
                })
            }

            // Check for moderate interactions
            if (this.DRUG_INTERACTIONS[current]?.moderate?.includes(proposed) ||
                this.DRUG_INTERACTIONS[proposed]?.moderate?.includes(current)) {
                interactions.push({
                    severity: 'moderate',
                    description: `Moderate interaction between ${currentMed.medicationName} and ${proposedMedication}`,
                    clinicalEffects: [
                        'Possible reduced effectiveness',
                        'Mild to moderate side effects'
                    ],
                    management: [
                        'Monitor patient response',
                        'Consider timing of administration',
                        'Educate patient on potential effects'
                    ]
                })
            }
        }

        return interactions
    }

    /**
     * Calculate immunization schedule
     */
    async calculateImmunizationSchedule(patientId: string, dateOfBirth: DateTime): Promise<ImmunizationSchedule[]> {
        const currentImmunizations = await PatientImmunization.query()
            .where('patient_id', patientId)
            .orderBy('administration_date', 'desc')

        const schedule: ImmunizationSchedule[] = []
        const age = DateTime.now().diff(dateOfBirth, 'years').years
        const lastVaccines = new Map<string, DateTime>()

        // Build map of last vaccination dates
        for (const immunization of currentImmunizations) {
            const vaccineName = immunization.vaccineName.toLowerCase()
            if (!lastVaccines.has(vaccineName)) {
                lastVaccines.set(vaccineName, immunization.administrationDate)
            }
        }

        // Check annual vaccines
        for (const vaccine of this.IMMUNIZATION_SCHEDULE.annual) {
            const lastDate = lastVaccines.get(vaccine)
            const dueDate = lastDate
                ? lastDate.plus({ years: 1 })
                : DateTime.now()

            const isOverdue = DateTime.now() > dueDate.plus({ months: 1 })

            schedule.push({
                vaccine,
                dueDate,
                isOverdue,
                priority: isOverdue ? 'urgent' : 'routine',
                notes: 'Annual vaccination recommended'
            })
        }

        // Check 10-year vaccines
        for (const vaccine of this.IMMUNIZATION_SCHEDULE.every_10_years) {
            const lastDate = lastVaccines.get(vaccine)
            const dueDate = lastDate
                ? lastDate.plus({ years: 10 })
                : DateTime.now()

            const isOverdue = DateTime.now() > dueDate

            schedule.push({
                vaccine,
                dueDate,
                isOverdue,
                priority: isOverdue ? 'recommended' : 'routine'
            })
        }

        // Check age-based vaccines
        for (const [requiredAge, vaccines] of Object.entries(this.IMMUNIZATION_SCHEDULE.age_based)) {
            if (age >= parseInt(requiredAge)) {
                for (const vaccine of vaccines) {
                    if (!lastVaccines.has(vaccine)) {
                        schedule.push({
                            vaccine,
                            dueDate: DateTime.now(),
                            isOverdue: true,
                            priority: 'recommended',
                            notes: `Recommended for age ${requiredAge}+`
                        })
                    }
                }
            }
        }

        return schedule.sort((a, b) => {
            // Sort by priority then by due date
            const priorityOrder = { 'urgent': 0, 'recommended': 1, 'routine': 2 }
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority]
            }
            return a.dueDate.toMillis() - b.dueDate.toMillis()
        })
    }

    /**
     * Calculate patient risk score
     */
    async calculateRiskScore(patientId: string, demographics: any, allergies: PatientAllergy[], medications: PatientMedication[]): Promise<RiskScore> {
        const factors: Array<{ category: string, factor: string, impact: number, weight: number }> = []

        // Age factor
        const age = demographics.age || 0
        if (age > 65) {
            factors.push({
                category: 'demographic',
                factor: 'Advanced age',
                impact: Math.min((age - 65) * 0.1, 0.3),
                weight: 0.2
            })
        }

        // Allergy factors
        const severeAllergies = allergies.filter(a =>
            a.severity === 'severe' || a.severity === 'life-threatening'
        )
        if (severeAllergies.length > 0) {
            factors.push({
                category: 'allergy',
                factor: 'Severe allergies',
                impact: Math.min(severeAllergies.length * 0.1, 0.2),
                weight: 0.15
            })
        }

        // Medication complexity
        const activeMedications = medications.filter(m => m.status === 'active')
        if (activeMedications.length > 5) {
            factors.push({
                category: 'medication',
                factor: 'Polypharmacy',
                impact: Math.min((activeMedications.length - 5) * 0.05, 0.25),
                weight: 0.15
            })
        }

        // Calculate category-specific scores
        const cardiovascular = this.calculateCategoryRisk(factors, 'cardiovascular')
        const diabetes = this.calculateCategoryRisk(factors, 'diabetes')
        const respiratory = this.calculateCategoryRisk(factors, 'respiratory')
        const infectious = this.calculateCategoryRisk(factors, 'infectious')

        // Calculate overall score
        const overall = factors.reduce((sum, factor) =>
            sum + (factor.impact * factor.weight), 0
        )

        return {
            overall: Math.min(overall, 1.0),
            cardiovascular,
            diabetes,
            respiratory,
            infectious,
            factors
        }
    }

    /**
     * Generate preventive care reminders
     */
    async generatePreventiveCareReminders(patientId: string, age: number, gender: string): Promise<PreventiveCareReminder[]> {
        const reminders: PreventiveCareReminder[] = []

        // Age and gender-based screenings
        if (age >= 50) {
            reminders.push({
                type: 'screening',
                title: 'Colorectal Cancer Screening',
                description: 'Colonoscopy or alternative screening method',
                dueDate: DateTime.now(),
                priority: 'high',
                ageGroup: '50+',
                guidelines: ['USPSTF Grade A recommendation', 'Every 10 years for colonoscopy']
            })
        }

        if (gender === 'female' && age >= 40) {
            reminders.push({
                type: 'screening',
                title: 'Mammography',
                description: 'Annual breast cancer screening',
                dueDate: DateTime.now(),
                priority: 'high',
                ageGroup: '40+',
                guidelines: ['Annual screening recommended', 'Earlier if family history']
            })
        }

        if (gender === 'female' && age >= 21) {
            reminders.push({
                type: 'screening',
                title: 'Cervical Cancer Screening',
                description: 'Pap smear or HPV testing',
                dueDate: DateTime.now(),
                priority: 'medium',
                ageGroup: '21+',
                guidelines: ['Every 3 years for Pap smear', 'Every 5 years for HPV testing']
            })
        }

        // General health screenings
        if (age >= 18) {
            reminders.push({
                type: 'checkup',
                title: 'Blood Pressure Check',
                description: 'Annual blood pressure screening',
                dueDate: DateTime.now(),
                priority: 'medium',
                ageGroup: '18+',
                guidelines: ['Annual screening for adults', 'More frequent if elevated']
            })

            reminders.push({
                type: 'checkup',
                title: 'Cholesterol Screening',
                description: 'Lipid panel every 5 years',
                dueDate: DateTime.now(),
                priority: 'medium',
                ageGroup: '20+',
                guidelines: ['Every 5 years starting at age 20', 'More frequent if risk factors present']
            })
        }

        return reminders.sort((a, b) => {
            const priorityOrder = { 'urgent': 0, 'high': 1, 'medium': 2, 'low': 3 }
            return priorityOrder[a.priority] - priorityOrder[b.priority]
        })
    }

    /**
     * Calculate category-specific risk
     */
    private calculateCategoryRisk(factors: any[], category: string): number {
        const categoryFactors = factors.filter(f => f.category === category)
        return categoryFactors.reduce((sum, factor) =>
            sum + (factor.impact * factor.weight), 0
        )
    }
}
