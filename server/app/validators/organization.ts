import vine from '@vinejs/vine'

export const createOrganizationValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(1).maxLength(255),
        type: vine.string().trim().optional(),
        registrationNumber: vine.string().trim().optional(),
        address: vine.string().trim().optional(),
        phone: vine.string().trim().optional(),
        email: vine.string().email().optional(),
        website: vine.string().url().optional(),
        status: vine.enum(['active', 'inactive', 'suspended']).optional(),
        settings: vine.object({}).optional(),
        branding: vine.object({}).optional(),
        timezone: vine.string().trim().optional(),
        currency: vine.string().trim().fixedLength(3).optional(),
        language: vine.string().trim().fixedLength(2).optional()
    })
)

export const updateOrganizationValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(1).maxLength(255).optional(),
        type: vine.string().trim().optional(),
        registrationNumber: vine.string().trim().optional(),
        address: vine.string().trim().optional(),
        phone: vine.string().trim().optional(),
        email: vine.string().email().optional(),
        website: vine.string().url().optional(),
        status: vine.enum(['active', 'inactive', 'suspended']).optional(),
        settings: vine.object({}).optional(),
        branding: vine.object({}).optional(),
        timezone: vine.string().trim().optional(),
        currency: vine.string().trim().fixedLength(3).optional(),
        language: vine.string().trim().fixedLength(2).optional()
    })
)
