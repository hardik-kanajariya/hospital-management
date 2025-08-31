import vine from '@vinejs/vine'

/**
 * Validator to validate the creation of a new role
 */
export const createRoleValidator = vine.compile(
    vine.object({
        name: vine
            .string()
            .trim()
            .minLength(2)
            .maxLength(100)
            .regex(/^[a-z0-9_]+$/)
            .unique(async (db, value) => {
                const role = await db.from('roles').where('name', value).first()
                return !role
            }),
        displayName: vine.string().trim().minLength(2).maxLength(255),
        description: vine.string().trim().maxLength(1000).optional(),
        accessLevel: vine.number().min(1).max(10),
        isActive: vine.boolean().optional(),
        permissions: vine
            .array(
                vine.object({
                    permissionId: vine.string().uuid(),
                    actions: vine.array(vine.enum(['create', 'read', 'update', 'delete']))
                })
            )
            .optional()
    })
)

/**
 * Validator to validate role updates
 */
export const updateRoleValidator = vine.compile(
    vine.object({
        displayName: vine.string().trim().minLength(2).maxLength(255),
        description: vine.string().trim().maxLength(1000).optional(),
        accessLevel: vine.number().min(1).max(10),
        isActive: vine.boolean().optional(),
        permissions: vine
            .array(
                vine.object({
                    permissionId: vine.string().uuid(),
                    actions: vine.array(vine.enum(['create', 'read', 'update', 'delete']))
                })
            )
            .optional()
    })
)
