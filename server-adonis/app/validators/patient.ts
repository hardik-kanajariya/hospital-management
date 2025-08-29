import vine from '@vinejs/vine'

/**
 * Validator to validate the patient creation payload
 */
export const patientValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(1),
        phone: vine.string().minLength(10),
        email: vine.string().email().normalizeEmail().optional(),
        dateOfBirth: vine.date(),
        gender: vine.enum(['male', 'female', 'other']),
        address: vine.string().trim().minLength(1),
        emergencyContact: vine.object({}).optional(),
        bloodGroup: vine.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
        allergies: vine.array(vine.string()).optional(),
        chronicConditions: vine.array(vine.string()).optional(),
        vaccinationRecords: vine.array(vine.object({})).optional(),
        insuranceInfo: vine.object({}).optional()
    })
)

/**
 * Validator to validate the patient update payload
 */
export const updatePatientValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(1).optional(),
        phone: vine.string().minLength(10).optional(),
        email: vine.string().email().normalizeEmail().optional(),
        dateOfBirth: vine.date().optional(),
        gender: vine.enum(['male', 'female', 'other']).optional(),
        address: vine.string().trim().minLength(1).optional(),
        emergencyContact: vine.object({}).optional(),
        bloodGroup: vine.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
        allergies: vine.array(vine.string()).optional(),
        chronicConditions: vine.array(vine.string()).optional(),
        vaccinationRecords: vine.array(vine.object({})).optional(),
        insuranceInfo: vine.object({}).optional()
    })
)
