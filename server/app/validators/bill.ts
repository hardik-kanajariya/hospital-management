import vine from '@vinejs/vine'

/**
 * Validator to validate the payload when creating
 * a new bill.
 */
export const billValidator = vine.compile(
    vine.object({
        patientId: vine.string().uuid(),
        appointmentId: vine.string().uuid().optional(),
        billDate: vine.date().optional(),
        dueDate: vine.date(),
        services: vine.array(vine.object({})).optional(),
        medications: vine.array(vine.object({})).optional(),
        subtotal: vine.number().min(0).optional(),
        taxAmount: vine.number().min(0).optional(),
        discountAmount: vine.number().min(0).optional(),
        totalAmount: vine.number().positive(),
        paidAmount: vine.number().min(0).optional(),
        status: vine.enum(['pending', 'partial', 'paid', 'overdue', 'cancelled']).optional(),
        paymentMethod: vine.enum(['cash', 'card', 'insurance', 'bank_transfer', 'other']).optional(),
        insuranceDetails: vine.object({}).optional(),
        notes: vine.string().maxLength(500).optional()
    })
)

/**
 * Validator to validate the payload when updating
 * an existing bill.
 */
export const updateBillValidator = vine.compile(
    vine.object({
        dueDate: vine.date().optional(),
        services: vine.array(vine.object({})).optional(),
        medications: vine.array(vine.object({})).optional(),
        subtotal: vine.number().min(0).optional(),
        taxAmount: vine.number().min(0).optional(),
        discountAmount: vine.number().min(0).optional(),
        totalAmount: vine.number().positive().optional(),
        paidAmount: vine.number().min(0).optional(),
        status: vine.enum(['pending', 'partial', 'paid', 'overdue', 'cancelled']).optional(),
        paymentMethod: vine.enum(['cash', 'card', 'insurance', 'bank_transfer', 'other']).optional(),
        insuranceDetails: vine.object({}).optional(),
        notes: vine.string().maxLength(500).optional()
    })
)
