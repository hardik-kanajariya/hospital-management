import vine from '@vinejs/vine'

/**
 * Validator to validate the payload when creating
 * a new medical record.
 */
export const medicalRecordValidator = vine.compile(
    vine.object({
        patientId: vine.string().uuid(),
        doctorId: vine.string().uuid(),
        appointmentId: vine.string().uuid().optional(),
        visitDate: vine.date().optional(),
        diagnosis: vine.string().minLength(5).maxLength(500),
        treatment: vine.string().minLength(5).maxLength(1000),
        medications: vine.array(vine.object({})).optional(),
        labResults: vine.array(vine.object({})).optional(),
        followUpInstructions: vine.array(vine.string()).optional(),
        nextVisitDate: vine.date().optional(),
        vitalSigns: vine.object({}).optional(),
        notes: vine.string().maxLength(2000).optional(),
        attachments: vine.array(vine.string()).optional()
    })
)

/**
 * Validator to validate the payload when updating
 * an existing medical record.
 */
export const updateMedicalRecordValidator = vine.compile(
    vine.object({
        visitDate: vine.date().optional(),
        diagnosis: vine.string().minLength(5).maxLength(500).optional(),
        treatment: vine.string().minLength(5).maxLength(1000).optional(),
        medications: vine.array(vine.object({})).optional(),
        labResults: vine.array(vine.object({})).optional(),
        followUpInstructions: vine.array(vine.string()).optional(),
        nextVisitDate: vine.date().optional(),
        vitalSigns: vine.object({}).optional(),
        notes: vine.string().maxLength(2000).optional(),
        attachments: vine.array(vine.string()).optional()
    })
)
