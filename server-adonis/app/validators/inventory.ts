import vine from '@vinejs/vine'

/**
 * Validator to validate the payload when creating
 * a new inventory item.
 */
export const inventoryValidator = vine.compile(
    vine.object({
        itemId: vine.string().optional(),
        name: vine.string().minLength(2).maxLength(100),
        description: vine.string().maxLength(500).optional(),
        category: vine.enum(['medication', 'equipment', 'supplies', 'other']),
        manufacturer: vine.string().maxLength(100).optional(),
        batchNumber: vine.string().maxLength(50).optional(),
        unitPrice: vine.number().positive(),
        quantityInStock: vine.number().min(0),
        minimumStockLevel: vine.number().min(0),
        unit: vine.string().minLength(1).maxLength(20),
        supplierInfo: vine.string().maxLength(500).optional(),
        expiryDate: vine.date().optional(),
        location: vine.string().maxLength(100).optional(),
        status: vine.enum(['active', 'inactive', 'expired', 'out_of_stock']).optional()
    })
)

/**
 * Validator to validate the payload when updating
 * an existing inventory item.
 */
export const updateInventoryValidator = vine.compile(
    vine.object({
        name: vine.string().minLength(2).maxLength(100).optional(),
        description: vine.string().maxLength(500).optional(),
        category: vine.enum(['medication', 'equipment', 'supplies', 'other']).optional(),
        manufacturer: vine.string().maxLength(100).optional(),
        batchNumber: vine.string().maxLength(50).optional(),
        unitPrice: vine.number().positive().optional(),
        quantityInStock: vine.number().min(0).optional(),
        minimumStockLevel: vine.number().min(0).optional(),
        unit: vine.string().minLength(1).maxLength(20).optional(),
        supplierInfo: vine.string().maxLength(500).optional(),
        expiryDate: vine.date().optional(),
        location: vine.string().maxLength(100).optional(),
        status: vine.enum(['active', 'inactive', 'expired', 'out_of_stock']).optional()
    })
)
