import vine from '@vinejs/vine'

/**
 * Validator to validate the payload when creating
 * a new appointment.
 */
export const appointmentValidator = vine.compile(
    vine.object({
        patientId: vine.string().uuid(),
        doctorId: vine.string().uuid(),
        appointmentDate: vine.date(),
        appointmentTime: vine.date(),
        duration: vine.number().positive().optional(),
        type: vine.enum(['consultation', 'follow_up', 'emergency', 'surgery', 'checkup']),
        status: vine.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
        priority: vine.enum(['normal', 'urgent', 'emergency']).optional(),
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
 */
export const updateAppointmentValidator = vine.compile(
    vine.object({
        appointmentDate: vine.date().optional(),
        appointmentTime: vine.date().optional(),
        duration: vine.number().positive().optional(),
        type: vine.enum(['consultation', 'follow_up', 'emergency', 'surgery', 'checkup']).optional(),
        status: vine.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
        priority: vine.enum(['normal', 'urgent', 'emergency']).optional(),
        reason: vine.string().minLength(3).maxLength(500).optional(),
        notes: vine.string().maxLength(1000).optional(),
        symptoms: vine.array(vine.string()).optional(),
        vitals: vine.object({}).optional(),
        roomNumber: vine.string().maxLength(20).optional()
    })
)
