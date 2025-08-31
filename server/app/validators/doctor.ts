import vine from '@vinejs/vine'

/**
 * Validator to validate the payload when creating
 * a new doctor.
 */
export const doctorValidator = vine.compile(
    vine.object({
        userId: vine.string().uuid(),
        specialization: vine.string().minLength(2).maxLength(100),
        qualification: vine.string().minLength(2).maxLength(255),
        experience: vine.number().positive().min(0).max(50),
        licenseNumber: vine.string().minLength(3).maxLength(50),
        department: vine.string().minLength(2).maxLength(100),
        availableDays: vine.array(vine.string()).optional(),
        availableHours: vine.object({}).optional(),
        consultationFee: vine.number().positive().optional(),
        isAvailable: vine.boolean().optional()
    })
)

/**
 * Validator to validate the payload when updating
 * an existing doctor.
 */
export const updateDoctorValidator = vine.compile(
    vine.object({
        specialization: vine.string().minLength(2).maxLength(100).optional(),
        qualification: vine.string().minLength(2).maxLength(255).optional(),
        experience: vine.number().positive().min(0).max(50).optional(),
        licenseNumber: vine.string().minLength(3).maxLength(50).optional(),
        department: vine.string().minLength(2).maxLength(100).optional(),
        availableDays: vine.array(vine.string()).optional(),
        availableHours: vine.object({}).optional(),
        consultationFee: vine.number().positive().optional(),
        isAvailable: vine.boolean().optional()
    })
)
