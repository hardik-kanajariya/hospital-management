import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Inventory from '#models/inventory'
import { v4 as uuid } from 'uuid'
import { inventoryValidator, updateInventoryValidator } from '#validators/inventory'

export default class InventoriesController {
    /**
     * Get all inventory items with pagination and filters
     */
    async index({ request, response }: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('limit', 10)
            const category = request.input('category', '')
            const lowStock = request.input('lowStock', false)
            const search = request.input('search', '')

            let query = Inventory.query()

            if (category) {
                query = query.where('category', category)
            }

            if (lowStock) {
                query = query.whereRaw('quantity_in_stock <= minimum_stock_level')
            }

            if (search) {
                query = query.where('name', 'like', `%${search}%`)
                    .orWhere('item_id', 'like', `%${search}%`)
            }

            query = query.orderBy('name', 'asc')

            const inventoryItems = await query.paginate(page, limit)

            return response.status(200).json({
                success: true,
                data: inventoryItems,
                message: 'Inventory items retrieved successfully'
            })

        } catch (error) {
            console.error('Inventory index error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving inventory items'
            })
        }
    }

    /**
     * Get single inventory item by ID
     */
    async show({ params, response }: HttpContext) {
        try {
            const inventoryItem = await Inventory.find(params.id)

            if (!inventoryItem) {
                return response.status(404).json({
                    success: false,
                    message: 'Inventory item not found'
                })
            }

            return response.status(200).json({
                success: true,
                data: inventoryItem,
                message: 'Inventory item retrieved successfully'
            })

        } catch (error) {
            console.error('Inventory show error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving inventory item'
            })
        }
    }

    /**
     * Create new inventory item
     */
    async store({ request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(inventoryValidator)

            // Generate item ID if not provided
            let itemId = payload.itemId
            if (!itemId) {
                const itemCount = await Inventory.query().count('* as total')
                itemId = `INV${String(Number(itemCount[0].$extras.total) + 1).padStart(6, '0')}`
            }

            const inventoryItem = new Inventory()
            inventoryItem.id = uuid()
            inventoryItem.itemId = itemId
            inventoryItem.name = payload.name
            inventoryItem.description = payload.description || null
            inventoryItem.category = payload.category
            inventoryItem.manufacturer = payload.manufacturer || null
            inventoryItem.batchNumber = payload.batchNumber || null
            inventoryItem.unitPrice = payload.unitPrice
            inventoryItem.quantityInStock = payload.quantityInStock
            inventoryItem.minimumStockLevel = payload.minimumStockLevel
            inventoryItem.unit = payload.unit
            inventoryItem.supplierInfo = payload.supplierInfo || null
            inventoryItem.expiryDate = payload.expiryDate ? DateTime.fromJSDate(payload.expiryDate) : null
            inventoryItem.location = payload.location || null
            inventoryItem.status = payload.status || 'active'

            await inventoryItem.save()

            return response.status(201).json({
                success: true,
                data: inventoryItem,
                message: 'Inventory item created successfully'
            })

        } catch (error) {
            console.error('Inventory store error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while creating inventory item'
            })
        }
    }

    /**
     * Update inventory item
     */
    async update({ params, request, response }: HttpContext) {
        try {
            const inventoryItem = await Inventory.find(params.id)

            if (!inventoryItem) {
                return response.status(404).json({
                    success: false,
                    message: 'Inventory item not found'
                })
            }

            const payload = await request.validateUsing(updateInventoryValidator)

            if (payload.name !== undefined) inventoryItem.name = payload.name
            if (payload.description !== undefined) inventoryItem.description = payload.description || null
            if (payload.category !== undefined) inventoryItem.category = payload.category
            if (payload.manufacturer !== undefined) inventoryItem.manufacturer = payload.manufacturer || null
            if (payload.batchNumber !== undefined) inventoryItem.batchNumber = payload.batchNumber || null
            if (payload.unitPrice !== undefined) inventoryItem.unitPrice = payload.unitPrice
            if (payload.quantityInStock !== undefined) inventoryItem.quantityInStock = payload.quantityInStock
            if (payload.minimumStockLevel !== undefined) inventoryItem.minimumStockLevel = payload.minimumStockLevel
            if (payload.unit !== undefined) inventoryItem.unit = payload.unit
            if (payload.supplierInfo !== undefined) inventoryItem.supplierInfo = payload.supplierInfo || null
            if (payload.expiryDate !== undefined) inventoryItem.expiryDate = payload.expiryDate ? DateTime.fromJSDate(payload.expiryDate) : null
            if (payload.location !== undefined) inventoryItem.location = payload.location || null
            if (payload.status !== undefined) inventoryItem.status = payload.status

            await inventoryItem.save()

            return response.status(200).json({
                success: true,
                data: inventoryItem,
                message: 'Inventory item updated successfully'
            })

        } catch (error) {
            console.error('Inventory update error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while updating inventory item'
            })
        }
    }

    /**
     * Delete inventory item
     */
    async destroy({ params, response }: HttpContext) {
        try {
            const inventoryItem = await Inventory.find(params.id)

            if (!inventoryItem) {
                return response.status(404).json({
                    success: false,
                    message: 'Inventory item not found'
                })
            }

            await inventoryItem.delete()

            return response.status(200).json({
                success: true,
                message: 'Inventory item deleted successfully'
            })

        } catch (error) {
            console.error('Inventory destroy error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while deleting inventory item'
            })
        }
    }

    /**
     * Update stock levels
     */
    async updateStock({ params, request, response }: HttpContext) {
        try {
            const inventoryItem = await Inventory.find(params.id)

            if (!inventoryItem) {
                return response.status(404).json({
                    success: false,
                    message: 'Inventory item not found'
                })
            }

            const quantity = request.input('quantity')
            const operation = request.input('operation') // 'add' or 'subtract'

            if (!quantity || quantity <= 0) {
                return response.status(400).json({
                    success: false,
                    message: 'Valid quantity is required'
                })
            }

            if (!['add', 'subtract'].includes(operation)) {
                return response.status(400).json({
                    success: false,
                    message: 'Operation must be either "add" or "subtract"'
                })
            }

            let newStock = inventoryItem.quantityInStock
            if (operation === 'add') {
                newStock += quantity
            } else {
                newStock -= quantity
                if (newStock < 0) {
                    return response.status(400).json({
                        success: false,
                        message: 'Insufficient stock available'
                    })
                }
            }

            inventoryItem.quantityInStock = newStock
            await inventoryItem.save()

            return response.status(200).json({
                success: true,
                data: inventoryItem,
                message: `Stock ${operation === 'add' ? 'added' : 'reduced'} successfully`
            })

        } catch (error) {
            console.error('Inventory stock update error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while updating stock'
            })
        }
    }

    /**
     * Get low stock items
     */
    async lowStock({ request, response }: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('limit', 10)

            const lowStockItems = await Inventory.query()
                .whereRaw('quantity_in_stock <= minimum_stock_level')
                .orderBy('quantity_in_stock', 'asc')
                .paginate(page, limit)

            return response.status(200).json({
                success: true,
                data: lowStockItems,
                message: 'Low stock items retrieved successfully'
            })

        } catch (error) {
            console.error('Low stock error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving low stock items'
            })
        }
    }

    /**
     * Get inventory summary/statistics
     */
    async summary({ response }: HttpContext) {
        try {
            const totalItems = await Inventory.query().count('* as total')
            const lowStockItems = await Inventory.query()
                .whereRaw('quantity_in_stock <= minimum_stock_level')
                .count('* as total')
            const outOfStockItems = await Inventory.query()
                .where('quantity_in_stock', 0)
                .count('* as total')
            const totalValue = await Inventory.query()
                .sum('unit_price * quantity_in_stock as value')

            const summary = {
                totalItems: totalItems[0].$extras.total,
                lowStockItems: lowStockItems[0].$extras.total,
                outOfStockItems: outOfStockItems[0].$extras.total,
                totalInventoryValue: totalValue[0].$extras.value || 0
            }

            return response.status(200).json({
                success: true,
                data: summary,
                message: 'Inventory summary retrieved successfully'
            })

        } catch (error) {
            console.error('Inventory summary error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving inventory summary'
            })
        }
    }
}