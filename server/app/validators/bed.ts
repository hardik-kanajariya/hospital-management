import vine from '@vinejs/vine'

/**
 * Validator to validate the payload when creating
 * a new bed.
 */
export const bedValidator = vine.compile(
    vine.object({
        bedNumber: vine.string().minLength(1).maxLength(10),
        roomNumber: vine.string().minLength(1).maxLength(10),
        ward: vine.string().minLength(2).maxLength(50),
        floor: vine.string().minLength(1).maxLength(10),
        type: vine.enum(['general', 'private', 'icu', 'emergency', 'pediatric', 'maternity']),
        status: vine.enum(['available', 'occupied', 'maintenance', 'cleaning', 'reserved']).optional(),
        dailyRate: vine.number().positive(),
        features: vine.array(vine.string()).optional(),
        notes: vine.string().maxLength(500).optional()
    })
)

/**
 * Validator to validate the payload when updating
 * an existing bed.
 */
export const updateBedValidator = vine.compile(
    vine.object({
        bedNumber: vine.string().minLength(1).maxLength(10).optional(),
        roomNumber: vine.string().minLength(1).maxLength(10).optional(),
        ward: vine.string().minLength(2).maxLength(50).optional(),
        floor: vine.string().minLength(1).maxLength(10).optional(),
        type: vine.enum(['general', 'private', 'icu', 'emergency', 'pediatric', 'maternity']).optional(),
        status: vine.enum(['available', 'occupied', 'maintenance', 'cleaning', 'reserved']).optional(),
        dailyRate: vine.number().positive().optional(),
        features: vine.array(vine.string()).optional(),
        notes: vine.string().maxLength(500).optional()
    })
)
