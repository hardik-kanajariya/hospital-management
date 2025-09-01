import vine from '@vinejs/vine'

/**
 * Validator to validate the payload when creating
 * a new appointment.
 * Updated to use master data instead of enums
 */
export const appointmentValidator = vine.compile(
    vine.object({
        patientId: vine.string().uuid(),
        doctorId: vine.string().uuid(),
        appointmentDate: vine.date(),
        appointmentTime: vine.date(),
        duration: vine.number().positive().optional(),
        type: vine.string().trim().minLength(1), // Changed from enum to string
        status: vine.string().trim().minLength(1).optional(), // Changed from enum to string
        priority: vine.string().trim().minLength(1).optional(), // Changed from enum to string
        reason: vine.string().minLength(3).maxLength(500),
        notes: vine.string().maxLength(1000).optional(),
        symptoms: vine.array(vine.string()).optional(),
        vitals: vine.object({}).optional(),
        roomNumber: vine.string().maxLength(20).optional()
    })
)

/**
 * Validator to validate the payload when updating
 * an existing appointment.
 * Updated to use master data instead of enums
 */
export const updateAppointmentValidator = vine.compile(
    vine.object({
        appointmentDate: vine.date().optional(),
        appointmentTime: vine.date().optional(),
        duration: vine.number().positive().optional(),
        type: vine.string().trim().minLength(1).optional(), // Changed from enum to string
        status: vine.string().trim().minLength(1).optional(), // Changed from enum to string
        priority: vine.string().trim().minLength(1).optional(), // Changed from enum to string
        reason: vine.string().minLength(3).maxLength(500).optional(),
        notes: vine.string().maxLength(1000).optional(),
        symptoms: vine.array(vine.string()).optional(),
        vitals: vine.object({}).optional(),
        roomNumber: vine.string().maxLength(20).optional()
    })
)
