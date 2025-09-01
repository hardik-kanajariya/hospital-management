import vine from '@vinejs/vine'

/**
 * Validator to validate the payload when creating
 * a new prescription.
 * Updated to use master data instead of enums
 */
export const prescriptionValidator = vine.compile(
    vine.object({
        patientId: vine.string().uuid(),
        doctorId: vine.string().uuid(),
        appointmentId: vine.string().uuid().optional(),
        prescriptionDate: vine.date().optional(),
        medications: vine.array(vine.object({})),
        diagnosis: vine.string().minLength(3).maxLength(500),
        instructions: vine.string().maxLength(1000).optional(),
        notes: vine.string().maxLength(500).optional(),
        status: vine.string().trim().minLength(1).optional(), // Changed from enum to string
        validUntil: vine.date().optional()
    })
)

/**
 * Validator to validate the payload when updating
 * an existing prescription.
 * Updated to use master data instead of enums
 */
export const updatePrescriptionValidator = vine.compile(
    vine.object({
        medications: vine.array(vine.object({})).optional(),
        diagnosis: vine.string().minLength(3).maxLength(500).optional(),
        instructions: vine.string().maxLength(1000).optional(),
        notes: vine.string().maxLength(500).optional(),
        status: vine.string().trim().minLength(1).optional(), // Changed from enum to string
        validUntil: vine.date().optional(),
        dispensedBy: vine.string().uuid().optional()
    })
)
