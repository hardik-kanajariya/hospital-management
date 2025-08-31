import vine from '@vinejs/vine'

/**
 * Validator to validate the login payload
 */
export const loginValidator = vine.compile(
    vine.object({
        email: vine.string().email().normalizeEmail(),
        password: vine.string().minLength(1)
    })
)

/**
 * Validator to validate the registration payload
 */
export const registerValidator = vine.compile(
    vine.object({
        email: vine.string().email().normalizeEmail(),
        password: vine.string().minLength(6),
        name: vine.string().trim().minLength(1),
        roleId: vine.string().uuid(),
        phone: vine.string().optional(),
        department: vine.string().optional(),
        employeeId: vine.string().optional()
    })
)

/**
 * Validator to validate the refresh token payload
 */
export const refreshTokenValidator = vine.compile(
    vine.object({
        refreshToken: vine.string()
    })
)

/**
 * Validator to validate the change password payload
 */
export const changePasswordValidator = vine.compile(
    vine.object({
        currentPassword: vine.string(),
        newPassword: vine.string().minLength(6),
        confirmPassword: vine.string().sameAs('newPassword')
    })
)
