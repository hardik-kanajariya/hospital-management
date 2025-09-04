import vine from '@vinejs/vine'

/**
 * Validator for complete patient registration with all related data
 */
export const completePatientRegistrationValidator = vine.compile(
    vine.object({
        // Basic patient information
        name: vine.string().trim().minLength(1),
        phone: vine.string().minLength(10),
        email: vine.string().email().optional(),
        date_of_birth: vine.date({
            formats: ['YYYY-MM-DD', 'MM-DD-YYYY', 'DD-MM-YYYY']
        }),
        gender: vine.string().trim().minLength(1),
        address: vine.string().trim().minLength(1),
        blood_group: vine.string().trim().optional(),

        // Demographics
        demographics: vine.object({
            ethnicity: vine.string().optional(),
            race: vine.string().optional(),
            primary_language: vine.string().optional(),
            secondary_language: vine.string().optional(),
            marital_status: vine.string().optional(),
            occupation: vine.string().optional(),
            employer: vine.string().optional(),
            education_level: vine.string().optional(),
            religion: vine.string().optional(),
            preferred_contact_method: vine.string().optional(),
            preferred_contact_time: vine.string().optional(),
            emergency_contact_1: vine.object({
                name: vine.string().optional(),
                relationship: vine.string().optional(),
                phone: vine.string().optional(),
                email: vine.string().email().optional(),
                address: vine.string().optional()
            }).optional(),
            emergency_contact_2: vine.object({
                name: vine.string().optional(),
                relationship: vine.string().optional(),
                phone: vine.string().optional(),
                email: vine.string().email().optional(),
                address: vine.string().optional()
            }).optional(),
            next_of_kin: vine.object({
                name: vine.string().optional(),
                relationship: vine.string().optional(),
                phone: vine.string().optional(),
                email: vine.string().email().optional(),
                address: vine.string().optional()
            }).optional()
        }).optional(),

        // Insurance information
        insurance: vine.object({
            insurance_type: vine.enum(['primary', 'secondary', 'tertiary']).optional(),
            provider_name: vine.string().optional(),
            policy_number: vine.string().optional(),
            group_number: vine.string().optional(),
            subscriber_name: vine.string().optional(),
            subscriber_relationship: vine.string().optional(),
            subscriber_dob: vine.date().optional(),
            effective_date: vine.date().optional(),
            expiry_date: vine.date().optional(),
            copay_amount: vine.number().optional(),
            deductible_amount: vine.number().optional(),
            coverage_details: vine.any().optional()
        }).optional(),

        // Communication preferences
        communication_preferences: vine.object({
            appointment_reminders: vine.boolean().optional(),
            appointment_reminder_method: vine.enum(['sms', 'email', 'call', 'all']).optional(),
            appointment_reminder_timing: vine.number().optional(),
            lab_results_notification: vine.boolean().optional(),
            lab_results_method: vine.enum(['sms', 'email', 'portal']).optional(),
            billing_notifications: vine.boolean().optional(),
            billing_method: vine.enum(['email', 'paper', 'both']).optional(),
            marketing_communications: vine.boolean().optional(),
            health_tips: vine.boolean().optional(),
            survey_participation: vine.boolean().optional()
        }).optional(),

        // Initial medical data
        allergies: vine.array(vine.object({
            allergen: vine.string(),
            severity: vine.enum(['mild', 'moderate', 'severe']),
            reaction_type: vine.string().optional(),
            notes: vine.string().optional()
        })).optional(),

        medications: vine.array(vine.object({
            medication_name: vine.string(),
            dosage: vine.string(),
            frequency: vine.string(),
            route: vine.string().optional(),
            start_date: vine.date(),
            end_date: vine.date().optional(),
            prescribing_doctor: vine.string().optional(),
            notes: vine.string().optional()
        })).optional(),

        immunizations: vine.array(vine.object({
            vaccine_name: vine.string(),
            date_administered: vine.date(),
            dose_number: vine.number().optional(),
            administrator: vine.string().optional(),
            lot_number: vine.string().optional(),
            manufacturer: vine.string().optional(),
            site_administered: vine.string().optional(),
            notes: vine.string().optional()
        })).optional(),

        family_history: vine.array(vine.object({
            relationship: vine.string(),
            condition: vine.string(),
            age_of_onset: vine.number().optional(),
            notes: vine.string().optional()
        })).optional()
    })
)

/**
 * Validator for patient merge operation
 */
export const patientMergeValidator = vine.compile(
    vine.object({
        keep_source_data: vine.array(vine.string()).optional(),
        merge_strategy: vine.enum(['keep_newest', 'keep_oldest', 'manual']).optional(),
        manual_selections: vine.any().optional(),
        reason: vine.string().optional()
    })
)

/**
 * Validator for allergy management
 */
export const allergyValidator = vine.compile(
    vine.object({
        allergen: vine.string().trim().minLength(1),
        severity: vine.enum(['mild', 'moderate', 'severe']),
        reaction_type: vine.string().optional(),
        onset_date: vine.date().optional(),
        notes: vine.string().optional(),
        verified_date: vine.date().optional(),
        verified_by: vine.string().optional()
    })
)

/**
 * Validator for medication management
 */
export const medicationValidator = vine.compile(
    vine.object({
        medication_name: vine.string().trim().minLength(1),
        generic_name: vine.string().optional(),
        dosage: vine.string().trim().minLength(1),
        frequency: vine.string().trim().minLength(1),
        route: vine.string().optional(),
        start_date: vine.date(),
        end_date: vine.date().optional(),
        prescribing_doctor: vine.string().optional(),
        pharmacy: vine.string().optional(),
        indication: vine.string().optional(),
        side_effects: vine.string().optional(),
        interactions: vine.string().optional(),
        notes: vine.string().optional(),
        is_active: vine.boolean().optional()
    })
)

/**
 * Validator for immunization records
 */
export const immunizationValidator = vine.compile(
    vine.object({
        vaccine_name: vine.string().trim().minLength(1),
        date_administered: vine.date(),
        dose_number: vine.number().optional(),
        series_complete: vine.boolean().optional(),
        administrator: vine.string().optional(),
        lot_number: vine.string().optional(),
        manufacturer: vine.string().optional(),
        expiration_date: vine.date().optional(),
        site_administered: vine.string().optional(),
        route: vine.string().optional(),
        next_due_date: vine.date().optional(),
        notes: vine.string().optional()
    })
)

/**
 * Validator for family history
 */
export const familyHistoryValidator = vine.compile(
    vine.object({
        relationship: vine.string().trim().minLength(1),
        condition: vine.string().trim().minLength(1),
        age_of_onset: vine.number().optional(),
        age_of_death: vine.number().optional(),
        cause_of_death: vine.string().optional(),
        notes: vine.string().optional(),
        severity: vine.enum(['mild', 'moderate', 'severe']).optional(),
        genetic_risk: vine.boolean().optional()
    })
)

/**
 * Validator for insurance management
 */
export const insuranceValidator = vine.compile(
    vine.object({
        insurance_type: vine.enum(['primary', 'secondary', 'tertiary']),
        provider_name: vine.string().trim().minLength(1),
        policy_number: vine.string().trim().minLength(1),
        group_number: vine.string().optional(),
        subscriber_name: vine.string().trim().minLength(1),
        subscriber_relationship: vine.string().optional(),
        subscriber_dob: vine.date().optional(),
        effective_date: vine.date(),
        expiry_date: vine.date().optional(),
        copay_amount: vine.number().optional(),
        deductible_amount: vine.number().optional(),
        coverage_details: vine.any().optional(),
        verification_status: vine.enum(['pending', 'verified', 'invalid']).optional()
    })
)

/**
 * Validator for document upload
 */
export const documentValidator = vine.compile(
    vine.object({
        document_type: vine.string().trim().minLength(1),
        title: vine.string().trim().minLength(1),
        description: vine.string().optional(),
        category: vine.string().optional(),
        expiry_date: vine.date().optional(),
        is_sensitive: vine.boolean().optional(),
        tags: vine.array(vine.string()).optional()
    })
)

/**
 * Validator for communication preferences
 */
export const communicationPreferencesValidator = vine.compile(
    vine.object({
        appointment_reminders: vine.boolean().optional(),
        appointment_reminder_method: vine.enum(['sms', 'email', 'call', 'all']).optional(),
        appointment_reminder_timing: vine.number().optional(),
        lab_results_notification: vine.boolean().optional(),
        lab_results_method: vine.enum(['sms', 'email', 'portal']).optional(),
        billing_notifications: vine.boolean().optional(),
        billing_method: vine.enum(['email', 'paper', 'both']).optional(),
        marketing_communications: vine.boolean().optional(),
        health_tips: vine.boolean().optional(),
        survey_participation: vine.boolean().optional(),
        preferred_pharmacy_id: vine.string().optional()
    })
)

/**
 * Validator for consent management
 */
export const consentValidator = vine.compile(
    vine.object({
        consent_type: vine.string().trim().minLength(1),
        title: vine.string().trim().minLength(1),
        description: vine.string().optional(),
        is_required: vine.boolean().optional(),
        expiry_date: vine.date().optional(),
        witness_name: vine.string().optional(),
        witness_signature: vine.string().optional(),
        notes: vine.string().optional()
    })
)

/**
 * Validator for bulk patient import
 */
export const bulkImportValidator = vine.compile(
    vine.object({
        import_type: vine.enum(['csv', 'excel']),
        validate_only: vine.boolean().optional(),
        update_existing: vine.boolean().optional(),
        duplicate_strategy: vine.enum(['skip', 'update', 'create_new']).optional()
    })
)

/**
 * Validator for advanced search
 */
export const advancedSearchValidator = vine.compile(
    vine.object({
        name: vine.string().optional(),
        phone: vine.string().optional(),
        email: vine.string().optional(),
        patient_id: vine.string().optional(),
        date_of_birth_from: vine.date().optional(),
        date_of_birth_to: vine.date().optional(),
        gender: vine.string().optional(),
        blood_group: vine.string().optional(),
        address: vine.string().optional(),
        city: vine.string().optional(),
        state: vine.string().optional(),
        postal_code: vine.string().optional(),
        insurance_provider: vine.string().optional(),
        allergies: vine.array(vine.string()).optional(),
        medications: vine.array(vine.string()).optional(),
        conditions: vine.array(vine.string()).optional(),
        last_visit_from: vine.date().optional(),
        last_visit_to: vine.date().optional(),
        age_from: vine.number().optional(),
        age_to: vine.number().optional(),
        created_from: vine.date().optional(),
        created_to: vine.date().optional(),
        sort_by: vine.string().optional(),
        sort_order: vine.enum(['asc', 'desc']).optional(),
        limit: vine.number().optional(),
        page: vine.number().optional()
    })
)
