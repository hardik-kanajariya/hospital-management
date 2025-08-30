import vine from '@vinejs/vine'

/**
 * Validator to validate the patient creation payload
 * Uses snake_case naming convention consistently
 */
export const patientValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(1),
        phone: vine.string().minLength(10),
        email: vine.string().email().normalizeEmail().optional(),
        date_of_birth: vine.date(),
        gender: vine.enum(['male', 'female', 'other']),
        address: vine.string().trim().minLength(1),
        // Emergency contact is optional for Indian village hospital context
        emergency_contact: vine.object({
            name: vine.string().optional(),
            relationship: vine.string().optional(),
            phone: vine.string().optional(),
            email: vine.string().email().normalizeEmail().optional(),
            address: vine.string().optional()
        }).optional(),
        blood_group: vine.string().trim().optional(),
        allergies: vine.array(vine.string()).optional(),
        chronic_conditions: vine.array(vine.string()).optional(),
        vaccination_records: vine.array(vine.object({})).optional(),
        insurance_info: vine.object({}).optional()
    })
)

/**
 * Validator to validate the patient update payload
 * Uses snake_case naming convention consistently
 */
export const updatePatientValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(1).optional(),
        phone: vine.string().minLength(10).optional(),
        email: vine.string().email().normalizeEmail().optional(),
        date_of_birth: vine.date().optional(),
        gender: vine.enum(['male', 'female', 'other']).optional(),
        address: vine.string().trim().minLength(1).optional(),
        emergency_contact: vine.object({
            name: vine.string().optional(),
            relationship: vine.string().optional(),
            phone: vine.string().optional(),
            email: vine.string().email().normalizeEmail().optional(),
            address: vine.string().optional()
        }).optional(),
        blood_group: vine.string().trim().optional(),
        allergies: vine.array(vine.string()).optional(),
        chronic_conditions: vine.array(vine.string()).optional(),
        vaccination_records: vine.array(vine.object({})).optional(),
        insurance_info: vine.object({}).optional()
    })
)
