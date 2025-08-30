import vine from '@vinejs/vine'

/**
 * Validator to validate user update payload
 */
export const updateUserValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(1).optional(),
        email: vine.string().email().normalizeEmail().optional(),
        password: vine.string().minLength(6).optional(),
        roleId: vine.string().uuid().optional(),
        phone: vine.string().optional(),
        department: vine.string().optional(),
        employeeId: vine.string().optional(),
        isActive: vine.boolean().optional()
    })
)

/**
 * Validator to validate user creation payload
 */
export const createUserValidator = vine.compile(
    vine.object({
        email: vine.string().email().normalizeEmail(),
        password: vine.string().minLength(6),
        name: vine.string().trim().minLength(1),
        roleId: vine.string().uuid(),
        phone: vine.string().optional(),
        department: vine.string().optional(),
        employeeId: vine.string().optional(),
        isActive: vine.boolean().optional()
    })
)
