import vine from '@vinejs/vine'

/**
 * Validator to validate the creation of a new permission
 */
export const createPermissionValidator = vine.compile(
    vine.object({
        name: vine
            .string()
            .trim()
            .minLength(2)
            .maxLength(100)
            .regex(/^[a-z0-9_]+$/)
            .unique(async (db, value) => {
                const permission = await db.from('permissions').where('name', value).first()
                return !permission
            }),
        displayName: vine.string().trim().minLength(2).maxLength(255),
        module: vine.string().trim().minLength(2).maxLength(100),
        description: vine.string().trim().maxLength(1000).optional(),
        isActive: vine.boolean().optional()
    })
)

/**
 * Validator to validate permission updates
 */
export const updatePermissionValidator = vine.compile(
    vine.object({
        displayName: vine.string().trim().minLength(2).maxLength(255),
        description: vine.string().trim().maxLength(1000).optional(),
        isActive: vine.boolean().optional()
    })
)
