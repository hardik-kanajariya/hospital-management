import { HttpContext } from '@adonisjs/core/http'
import Database from '@adonisjs/lucid/services/db'

export default class MasterDataController {
    /**
     * Get all categories with their master data items
     */
    async getCategories({ response }: HttpContext) {
        try {
            const categories = await Database
                .from('master_data')
                .distinct('category')
                .orderBy('category')

            const categoriesList = categories.map(row => row.category)

            return response.ok({
                success: true,
                data: categoriesList
            })
        } catch (error) {
            return response.internalServerError({
                success: false,
                message: 'Failed to fetch categories',
                error: error.message
            })
        }
    }

    /**
     * Get master data by category
     */
    async getByCategory({ params, response }: HttpContext) {
        try {
            const { category } = params

            const masterData = await Database
                .from('master_data')
                .where('category', category)
                .where('is_active', true)
                .orderBy('display_order', 'asc')
                .orderBy('name', 'asc')

            return response.ok({
                success: true,
                data: masterData
            })
        } catch (error) {
            return response.internalServerError({
                success: false,
                message: 'Failed to fetch master data',
                error: error.message
            })
        }
    }

    /**
     * Get all master data
     */
    async index({ request, response }: HttpContext) {
        try {
            const { category, search, is_active } = request.qs()

            let query = Database
                .from('master_data')
                .select('*')

            if (category) {
                query = query.where('category', category)
            }

            if (search) {
                query = query.where(builder => {
                    builder
                        .whereILike('name', `%${search}%`)
                        .orWhereILike('description', `%${search}%`)
                })
            }

            if (is_active !== undefined) {
                query = query.where('is_active', is_active === 'true')
            }

            const masterData = await query
                .orderBy('category', 'asc')
                .orderBy('display_order', 'asc')
                .orderBy('name', 'asc')

            return response.ok({
                success: true,
                data: masterData
            })
        } catch (error) {
            return response.internalServerError({
                success: false,
                message: 'Failed to fetch master data',
                error: error.message
            })
        }
    }

    /**
     * Create new master data item
     */
    async store({ request, response }: HttpContext) {
        try {
            const data = request.only([
                'category',
                'name',
                'description',
                'value',
                'display_order',
                'is_system',
                'is_active'
            ])

            // Check for duplicate names within the same category
            const existing = await Database
                .from('master_data')
                .where('category', data.category)
                .whereRaw('LOWER(name) = ?', [data.name.toLowerCase()])
                .first()

            if (existing) {
                return response.badRequest({
                    success: false,
                    message: 'Item with this name already exists in the category'
                })
            }

            // If no display_order provided, set to max + 1
            if (!data.display_order) {
                const maxOrder = await Database
                    .from('master_data')
                    .where('category', data.category)
                    .max('display_order as max_order')
                    .first()

                data.display_order = (maxOrder?.max_order || 0) + 1
            }

            const [insertedId] = await Database
                .table('master_data')
                .insert({
                    ...data,
                    is_system: data.is_system || false,
                    is_active: data.is_active !== false,
                    created_at: new Date(),
                    updated_at: new Date()
                })

            const newItem = await Database
                .from('master_data')
                .where('id', insertedId)
                .first()

            return response.created({
                success: true,
                message: 'Master data item created successfully',
                data: newItem
            })
        } catch (error) {
            return response.internalServerError({
                success: false,
                message: 'Failed to create master data item',
                error: error.message
            })
        }
    }

    /**
     * Update master data item
     */
    async update({ params, request, response }: HttpContext) {
        try {
            const { id } = params
            const data = request.only([
                'name',
                'description',
                'value',
                'display_order',
                'is_active'
            ])

            const existingItem = await Database
                .from('master_data')
                .where('id', id)
                .first()

            if (!existingItem) {
                return response.notFound({
                    success: false,
                    message: 'Master data item not found'
                })
            }

            // Prevent editing system items' core properties
            if (existingItem.is_system) {
                // Only allow updating display_order and is_active for system items
                const updateData: any = {}

                if (data.display_order !== undefined) {
                    updateData.display_order = data.display_order
                }
                if (data.is_active !== undefined) {
                    updateData.is_active = data.is_active
                }

                if (Object.keys(updateData).length === 0) {
                    return response.badRequest({
                        success: false,
                        message: 'System items can only have display order and status updated'
                    })
                }

                await Database
                    .from('master_data')
                    .where('id', id)
                    .update({
                        ...updateData,
                        updated_at: new Date()
                    })
            } else {
                // Check for duplicate names within the same category (excluding current item)
                if (data.name) {
                    const existing = await Database
                        .from('master_data')
                        .where('category', existingItem.category)
                        .where('id', '!=', id)
                        .whereRaw('LOWER(name) = ?', [data.name.toLowerCase()])
                        .first()

                    if (existing) {
                        return response.badRequest({
                            success: false,
                            message: 'Item with this name already exists in the category'
                        })
                    }
                }

                await Database
                    .from('master_data')
                    .where('id', id)
                    .update({
                        ...data,
                        updated_at: new Date()
                    })
            }

            const updatedItem = await Database
                .from('master_data')
                .where('id', id)
                .first()

            return response.ok({
                success: true,
                message: 'Master data item updated successfully',
                data: updatedItem
            })
        } catch (error) {
            return response.internalServerError({
                success: false,
                message: 'Failed to update master data item',
                error: error.message
            })
        }
    }

    /**
     * Toggle active status of master data item
     */
    async toggleStatus({ params, response }: HttpContext) {
        try {
            const { id } = params

            const existingItem = await Database
                .from('master_data')
                .where('id', id)
                .first()

            if (!existingItem) {
                return response.notFound({
                    success: false,
                    message: 'Master data item not found'
                })
            }

            const newStatus = !existingItem.is_active

            await Database
                .from('master_data')
                .where('id', id)
                .update({
                    is_active: newStatus,
                    updated_at: new Date()
                })

            return response.ok({
                success: true,
                message: `Master data item ${newStatus ? 'activated' : 'deactivated'} successfully`,
                data: { is_active: newStatus }
            })
        } catch (error) {
            return response.internalServerError({
                success: false,
                message: 'Failed to toggle master data status',
                error: error.message
            })
        }
    }

    /**
     * Delete master data item (soft delete by setting is_active to false)
     */
    async destroy({ params, response }: HttpContext) {
        try {
            const { id } = params

            const existingItem = await Database
                .from('master_data')
                .where('id', id)
                .first()

            if (!existingItem) {
                return response.notFound({
                    success: false,
                    message: 'Master data item not found'
                })
            }

            if (existingItem.is_system) {
                return response.badRequest({
                    success: false,
                    message: 'System items cannot be deleted'
                })
            }

            // Soft delete by setting is_active to false
            await Database
                .from('master_data')
                .where('id', id)
                .update({
                    is_active: false,
                    updated_at: new Date()
                })

            return response.ok({
                success: true,
                message: 'Master data item deleted successfully'
            })
        } catch (error) {
            return response.internalServerError({
                success: false,
                message: 'Failed to delete master data item',
                error: error.message
            })
        }
    }

}
