import type { HttpContext } from '@adonisjs/core/http'
import Permission from '#models/permission'
import { createPermissionValidator, updatePermissionValidator } from '#validators/permission'

export default class PermissionsController {
    /**
     * Display a list of all permissions
     */
    async index({ response }: HttpContext) {
        try {
            const permissions = await Permission.query()
                .preload('roles')
                .orderBy('module')
                .orderBy('name')

            return response.ok({
                success: true,
                data: permissions
            })
        } catch (error) {
            return response.internalServerError({
                success: false,
                message: 'Failed to fetch permissions',
                error: error.message
            })
        }
    }

    /**
     * Handle creation of a new permission
     */
    async store({ request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(createPermissionValidator)

            const permission = await Permission.create({
                id: crypto.randomUUID(),
                name: payload.name,
                displayName: payload.displayName,
                module: payload.module,
                description: payload.description,
                isActive: payload.isActive ?? true
            })

            return response.created({
                success: true,
                message: 'Permission created successfully',
                data: permission
            })
        } catch (error) {
            return response.badRequest({
                success: false,
                message: 'Failed to create permission',
                error: error.message
            })
        }
    }

    /**
     * Show a single permission
     */
    async show({ params, response }: HttpContext) {
        try {
            const permission = await Permission.query()
                .where('id', params.id)
                .preload('roles')
                .firstOrFail()

            return response.ok({
                success: true,
                data: permission
            })
        } catch (error) {
            return response.notFound({
                success: false,
                message: 'Permission not found'
            })
        }
    }

    /**
     * Handle permission updates
     */
    async update({ params, request, response }: HttpContext) {
        try {
            const permission = await Permission.findOrFail(params.id)
            const payload = await request.validateUsing(updatePermissionValidator)

            permission.merge({
                displayName: payload.displayName,
                description: payload.description,
                isActive: payload.isActive
            })

            await permission.save()

            return response.ok({
                success: true,
                message: 'Permission updated successfully',
                data: permission
            })
        } catch (error) {
            return response.badRequest({
                success: false,
                message: 'Failed to update permission',
                error: error.message
            })
        }
    }

    /**
     * Delete a permission
     */
    async destroy({ params, response }: HttpContext) {
        try {
            const permission = await Permission.findOrFail(params.id)

            // Check if permission is assigned to any roles
            await permission.load('roles')
            if (permission.roles.length > 0) {
                return response.badRequest({
                    success: false,
                    message: 'Cannot delete permission assigned to roles. Please remove from roles first.'
                })
            }

            await permission.delete()

            return response.ok({
                success: true,
                message: 'Permission deleted successfully'
            })
        } catch (error) {
            return response.badRequest({
                success: false,
                message: 'Failed to delete permission',
                error: error.message
            })
        }
    }

    /**
     * Get permissions grouped by module
     */
    async modules({ response }: HttpContext) {
        try {
            const permissions = await Permission.query()
                .where('isActive', true)
                .orderBy('module')
                .orderBy('name')

            // Group permissions by module
            const grouped = permissions.reduce((acc, permission) => {
                if (!acc[permission.module]) {
                    acc[permission.module] = []
                }
                acc[permission.module].push(permission)
                return acc
            }, {} as Record<string, typeof permissions>)

            return response.ok({
                success: true,
                data: grouped
            })
        } catch (error) {
            return response.internalServerError({
                success: false,
                message: 'Failed to fetch permissions',
                error: error.message
            })
        }
    }
}
