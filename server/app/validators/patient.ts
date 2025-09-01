import vine from '@vinejs/vine'

/**
 * Validator to validate the patient creation payload
 * Uses snake_case naming convention consistently
 * Updated to use master data instead of enums
 */
export const patientValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(1),
        phone: vine.string().minLength(10),
        email: vine.string().email().optional(),
        date_of_birth: vine.date({
            formats: ['YYYY-MM-DD', 'MM-DD-YYYY', 'DD-MM-YYYY']
        }),
        gender: vine.string().trim().minLength(1), // Changed from enum to string
        address: vine.string().trim().minLength(1),
        // Emergency contact is optional for Indian village hospital context
        emergency_contact: vine.object({
            name: vine.string().optional(),
            relationship: vine.string().optional(),
            phone: vine.string().optional(),
            email: vine.string().email().optional(),
            address: vine.string().optional()
        }).optional(),
        blood_group: vine.string().trim().optional(), // Changed from enum to string
        allergies: vine.array(vine.string()).optional(),
        chronic_conditions: vine.array(vine.string()).optional(),
        vaccination_records: vine.array(vine.object({
            vaccine_name: vine.string().optional(),
            date_administered: vine.string().optional(),
            next_due_date: vine.string().optional(),
            administered_by: vine.string().optional(),
            batch_number: vine.string().optional(),
            notes: vine.string().optional()
        })).optional(),
        insurance_info: vine.object({
            provider: vine.string().optional(),
            policy_number: vine.string().optional(),
            coverage_amount: vine.number().optional(),
            expiry_date: vine.string().optional(),
            copay_amount: vine.number().optional()
        }).optional()
    })
)

/**
 * Validator to validate the patient update payload
 * Uses snake_case naming convention consistently
 * Updated to use master data instead of enums
 */
export const updatePatientValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(1).optional(),
        phone: vine.string().minLength(10).optional(),
        email: vine.string().email().optional(),
        date_of_birth: vine.date({
            formats: ['YYYY-MM-DD', 'MM-DD-YYYY', 'DD-MM-YYYY']
        }).optional(),
        gender: vine.string().trim().minLength(1).optional(), // Changed from enum to string
        address: vine.string().trim().minLength(1).optional(),
        emergency_contact: vine.object({
            name: vine.string().optional(),
            relationship: vine.string().optional(),
            phone: vine.string().optional(),
            email: vine.string().email().optional(),
            address: vine.string().optional()
        }).optional(),
        blood_group: vine.string().trim().optional(), // Changed from enum to string
        allergies: vine.array(vine.string()).optional(),
        chronic_conditions: vine.array(vine.string()).optional(),
        vaccination_records: vine.array(vine.object({
            vaccine_name: vine.string().optional(),
            date_administered: vine.string().optional(),
            next_due_date: vine.string().optional(),
            administered_by: vine.string().optional(),
            batch_number: vine.string().optional(),
            notes: vine.string().optional()
        })).optional(),
        insurance_info: vine.object({
            provider: vine.string().optional(),
            policy_number: vine.string().optional(),
            coverage_amount: vine.number().optional(),
            expiry_date: vine.string().optional(),
            copay_amount: vine.number().optional()
        }).optional()
    })
)
