import vine from '@vinejs/vine'

/**
 * Validator to validate the payload when creating
 * a new notification.
 * Updated to use master data instead of enums
 */
export const notificationValidator = vine.compile(
    vine.object({
        userId: vine.string().uuid(),
        title: vine.string().minLength(3).maxLength(200),
        message: vine.string().minLength(5).maxLength(1000),
        type: vine.string().trim().minLength(1), // Changed from enum to string
        priority: vine.string().trim().minLength(1).optional(), // Changed from enum to string
        isRead: vine.boolean().optional(),
        data: vine.object({}).optional(),
        actionUrl: vine.string().maxLength(500).optional(),
        expiresAt: vine.date().optional()
    })
)

/**
 * Validator to validate the payload when updating
 * an existing notification.
 * Updated to use master data instead of enums
 */
export const updateNotificationValidator = vine.compile(
    vine.object({
        title: vine.string().minLength(3).maxLength(200).optional(),
        message: vine.string().minLength(5).maxLength(1000).optional(),
        type: vine.string().trim().minLength(1).optional(), // Changed from enum to string
        priority: vine.string().trim().minLength(1).optional(), // Changed from enum to string
        isRead: vine.boolean().optional(),
        data: vine.object({}).optional(),
        actionUrl: vine.string().maxLength(500).optional(),
        expiresAt: vine.date().optional()
    })
)
