import vine from '@vinejs/vine'

/**
 * Medical data structure validators
 */
const medicationSchema = vine.object({
    name: vine.string().minLength(2).maxLength(100),
    dosage: vine.string().minLength(1).maxLength(50),
    frequency: vine.string().minLength(1).maxLength(50),
    duration: vine.string().minLength(1).maxLength(50),
    instructions: vine.string().maxLength(500).optional(),
    startDate: vine.date().optional(),
    endDate: vine.date().optional(),
    prescribedBy: vine.string().maxLength(100).optional(),
    status: vine.enum(['active', 'completed', 'discontinued']).optional()
})

const labResultSchema = vine.object({
    testName: vine.string().minLength(2).maxLength(100),
    result: vine.string().minLength(1).maxLength(100),
    normalRange: vine.string().minLength(1).maxLength(100),
    unit: vine.string().maxLength(20).optional(),
    status: vine.enum(['normal', 'high', 'low', 'critical']).optional(),
    date: vine.date().optional(),
    notes: vine.string().maxLength(500).optional(),
    reference: vine.string().maxLength(500).optional()
})

const vitalSignsSchema = vine.object({
    temperature: vine.number().min(30).max(45).optional(),
    bloodPressure: vine.object({
        systolic: vine.number().min(60).max(250),
        diastolic: vine.number().min(30).max(150)
    }).optional(),
    heartRate: vine.number().min(30).max(200).optional(),
    respiratoryRate: vine.number().min(8).max(40).optional(),
    oxygenSaturation: vine.number().min(70).max(100).optional(),
    weight: vine.number().min(0.5).max(500).optional(),
    height: vine.number().min(30).max(250).optional()
})

const attachmentSchema = vine.object({
    name: vine.string().minLength(1).maxLength(255),
    url: vine.string().url(),
    type: vine.enum(['image', 'document', 'video', 'audio']),
    size: vine.number().min(1).optional(),
    uploadedAt: vine.date().optional()
})

/**
 * Validator to validate the payload when creating
 * a new medical record.
 */
export const medicalRecordValidator = vine.compile(
    vine.object({
        patientId: vine.string().uuid(),
        doctorId: vine.string().uuid(),
        appointmentId: vine.string().uuid().optional(),
        visitDate: vine.date().optional(),
        diagnosis: vine.string().minLength(5).maxLength(500),
        treatment: vine.string().minLength(5).maxLength(1000),
        medications: vine.array(medicationSchema).optional(),
        labResults: vine.array(labResultSchema).optional(),
        followUpInstructions: vine.array(vine.string().minLength(1).maxLength(500)).optional(),
        nextVisitDate: vine.date().optional(),
        vitalSigns: vitalSignsSchema.optional(),
        notes: vine.string().maxLength(2000).optional(),
        attachments: vine.array(attachmentSchema).optional()
    })
)

/**
 * Validator to validate the payload when updating
 * an existing medical record.
 */
export const updateMedicalRecordValidator = vine.compile(
    vine.object({
        visitDate: vine.date().optional(),
        diagnosis: vine.string().minLength(5).maxLength(500).optional(),
        treatment: vine.string().minLength(5).maxLength(1000).optional(),
        medications: vine.array(medicationSchema).optional(),
        labResults: vine.array(labResultSchema).optional(),
        followUpInstructions: vine.array(vine.string().minLength(1).maxLength(500)).optional(),
        nextVisitDate: vine.date().optional(),
        vitalSigns: vitalSignsSchema.optional(),
        notes: vine.string().maxLength(2000).optional(),
        attachments: vine.array(attachmentSchema).optional()
    })
)

/**
 * Validator for medical record search
 */
export const searchMedicalRecordsValidator = vine.compile(
    vine.object({
        search: vine.string().minLength(2).maxLength(100),
        page: vine.number().min(1).optional(),
        limit: vine.number().min(1).max(100).optional(),
        patientId: vine.string().uuid().optional(),
        doctorId: vine.string().uuid().optional(),
        fromDate: vine.date().optional(),
        toDate: vine.date().optional()
    })
)
