import vine from '@vinejs/vine'

/**
 * Validator to validate the payload when creating
 * a new lab test.
 * Updated to use master data instead of enums
 */
export const labTestValidator = vine.compile(
    vine.object({
        patientId: vine.string().uuid(),
        doctorId: vine.string().uuid(),
        testName: vine.string().minLength(2).maxLength(100),
        testType: vine.string().minLength(2).maxLength(50),
        category: vine.string().minLength(2).maxLength(50),
        description: vine.string().maxLength(500).optional(),
        orderedDate: vine.date().optional(),
        sampleCollectedDate: vine.date().optional(),
        status: vine.string().trim().minLength(1).optional(), // Changed from enum to string
        priority: vine.string().trim().minLength(1).optional(), // Changed from enum to string
        results: vine.object({}).optional(),
        referenceRanges: vine.object({}).optional(),
        notes: vine.string().maxLength(1000).optional(),
        technicianId: vine.string().uuid().optional()
    })
)

/**
 * Validator to validate the payload when updating
 * an existing lab test.
 * Updated to use master data instead of enums
 */
export const updateLabTestValidator = vine.compile(
    vine.object({
        testName: vine.string().minLength(2).maxLength(100).optional(),
        testType: vine.string().minLength(2).maxLength(50).optional(),
        category: vine.string().minLength(2).maxLength(50).optional(),
        description: vine.string().maxLength(500).optional(),
        orderedDate: vine.date().optional(),
        sampleCollectedDate: vine.date().optional(),
        resultDate: vine.date().optional(),
        status: vine.string().trim().minLength(1).optional(), // Changed from enum to string
        priority: vine.string().trim().minLength(1).optional(), // Changed from enum to string
        results: vine.object({}).optional(),
        referenceRanges: vine.object({}).optional(),
        interpretation: vine.string().maxLength(1000).optional(),
        notes: vine.string().maxLength(1000).optional(),
        technicianId: vine.string().uuid().optional(),
        verifiedBy: vine.string().uuid().optional(),
        attachments: vine.array(vine.string()).optional()
    })
)
