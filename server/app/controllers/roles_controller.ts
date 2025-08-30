import type { HttpContext } from '@adonisjs/core/http'
import Role from '#models/role'
import Permission from '#models/permission'
import { createRoleValidator, updateRoleValidator } from '#validators/role'

export default class RolesController {
    /**
     * Display a list of all roles
     */
    async index({ response }: HttpContext) {
        try {
            const roles = await Role.query()
                .preload('permissions')
                .withCount('users')
                .orderBy('accessLevel', 'desc')

            // Transform the data to include userCount properly
            const rolesWithCount = roles.map(role => {
                const roleData = role.serialize()
                return {
                    ...roleData,
                    userCount: role.$extras.users_count || 0
                }
            })

            return response.ok({
                success: true,
                data: rolesWithCount
            })
        } catch (error) {
            return response.internalServerError({
                success: false,
                message: 'Failed to fetch roles',
                error: error.message
            })
        }
    }

    /**
     * Show form for creating a new role
     */
    async create({ }: HttpContext) { }

    /**
     * Handle creation of a new role
     */
    async store({ request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(createRoleValidator)

            const role = await Role.create({
                id: crypto.randomUUID(),
                name: payload.name,
                displayName: payload.displayName,
                description: payload.description,
                accessLevel: payload.accessLevel,
                isActive: payload.isActive ?? true,
                isSystemRole: false
            })

            // Attach permissions if provided
            if (payload.permissions && payload.permissions.length > 0) {
                for (const permissionData of payload.permissions) {
                    await role.related('permissions').attach({
                        [permissionData.permissionId]: {
                            actions: permissionData.actions
                        }
                    })
                }
            }

            await role.load('permissions')

            return response.created({
                success: true,
                message: 'Role created successfully',
                data: role
            })
        } catch (error) {
            return response.badRequest({
                success: false,
                message: 'Failed to create role',
                error: error.message
            })
        }
    }

    /**
     * Show a single role
     */
    async show({ params, response }: HttpContext) {
        try {
            const role = await Role.query()
                .where('id', params.id)
                .preload('permissions')
                .preload('users')
                .firstOrFail()

            return response.ok({
                success: true,
                data: role
            })
        } catch (error) {
            return response.notFound({
                success: false,
                message: 'Role not found'
            })
        }
    }

    /**
     * Show form for editing a role
     */
    async edit({ params }: HttpContext) { }

    /**
     * Handle role updates
     */
    async update({ params, request, response }: HttpContext) {
        try {
            const role = await Role.findOrFail(params.id)

            // Prevent updating system roles
            if (role.isSystemRole) {
                return response.forbidden({
                    success: false,
                    message: 'System roles cannot be modified'
                })
            }

            const payload = await request.validateUsing(updateRoleValidator)

            role.merge({
                displayName: payload.displayName,
                description: payload.description,
                accessLevel: payload.accessLevel,
                isActive: payload.isActive
            })

            await role.save()

            // Update permissions if provided
            if (payload.permissions) {
                // Detach all existing permissions
                await role.related('permissions').detach()

                // Attach new permissions
                for (const permissionData of payload.permissions) {
                    await role.related('permissions').attach({
                        [permissionData.permissionId]: {
                            actions: permissionData.actions
                        }
                    })
                }
            }

            await role.load('permissions')

            return response.ok({
                success: true,
                message: 'Role updated successfully',
                data: role
            })
        } catch (error) {
            return response.badRequest({
                success: false,
                message: 'Failed to update role',
                error: error.message
            })
        }
    }

    /**
     * Delete a role
     */
    async destroy({ params, response }: HttpContext) {
        try {
            const role = await Role.findOrFail(params.id)

            // Prevent deleting system roles
            if (role.isSystemRole) {
                return response.forbidden({
                    success: false,
                    message: 'System roles cannot be deleted'
                })
            }

            // Check if role has users assigned
            await role.load('users')
            if (role.users.length > 0) {
                return response.badRequest({
                    success: false,
                    message: 'Cannot delete role with assigned users. Please reassign users first.'
                })
            }

            await role.delete()

            return response.ok({
                success: true,
                message: 'Role deleted successfully'
            })
        } catch (error) {
            return response.badRequest({
                success: false,
                message: 'Failed to delete role',
                error: error.message
            })
        }
    }

    /**
     * Get available permissions for role assignment
     */
    async permissions({ response }: HttpContext) {
        try {
            const permissions = await Permission.query()
                .where('isActive', true)
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
}
