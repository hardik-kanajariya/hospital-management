import type { HttpContext } from '@adonisjs/core/http'
import Organization from '#models/organization'
import User from '#models/user'
import Role from '#models/role'
import UserAuditLog from '#models/user_audit_log'
import OrganizationSeedingService from '#services/organization_seeding_service'
import { createOrganizationValidator, updateOrganizationValidator } from '#validators/organization'

export default class OrganizationsController {
    /**
     * Display a list of organizations
     */
    async index({ request, response, auth }: HttpContext) {
        try {
            const user = await auth.getUserOrFail()
            const page = request.input('page', 1)
            const limit = request.input('limit', 10)
            const search = request.input('search', '')
            const status = request.input('status', '')

            // Check if user is super admin
            const isSuperAdmin = await this.isSuperAdmin(user)
            if (!isSuperAdmin) {
                return response.forbidden({ message: 'Access denied. Super admin required.' })
            }

            const query = Organization.query()

            if (search) {
                query.where((builder) => {
                    builder.whereILike('name', `%${search}%`)
                        .orWhereILike('type', `%${search}%`)
                        .orWhereILike('registration_number', `%${search}%`)
                })
            }

            if (status) {
                query.where('status', status)
            }

            const organizations = await query
                .preload('users', (userQuery) => {
                    userQuery.where('is_active', true).limit(5)
                })
                .orderBy('created_at', 'desc')
                .paginate(page, limit)

            return response.ok({
                organizations: organizations.toJSON(),
                message: 'Organizations fetched successfully'
            })
        } catch (error) {
            return response.badRequest({ message: 'Failed to fetch organizations', error: error.message })
        }
    }

    /**
     * Show a single organization
     */
    async show({ params, response, auth }: HttpContext) {
        try {
            const user = await auth.getUserOrFail()
            const organizationId = params.id

            // Check access permissions
            const hasAccess = await this.checkOrganizationAccess(user, organizationId)
            if (!hasAccess) {
                return response.forbidden({ message: 'Access denied to this organization.' })
            }

            const organization = await Organization.query()
                .where('id', organizationId)
                .preload('users', (userQuery) => {
                    userQuery.where('is_active', true).preload('roles')
                })
                .preload('roles', (roleQuery) => {
                    roleQuery.where('is_active', true).preload('permissions')
                })
                .firstOrFail()

            return response.ok({
                organization: organization.toJSON(),
                message: 'Organization fetched successfully'
            })
        } catch (error) {
            return response.notFound({ message: 'Organization not found' })
        }
    }

    /**
     * Create a new organization
     */
    async store({ request, response, auth }: HttpContext) {
        try {
            const user = await auth.getUserOrFail()

            // Check if user is super admin
            const isSuperAdmin = await this.isSuperAdmin(user)
            if (!isSuperAdmin) {
                return response.forbidden({ message: 'Access denied. Super admin required.' })
            }

            const payload = await request.validateUsing(createOrganizationValidator)

            const organization = await Organization.create(payload)

            // Seed organization data with system defaults
            try {
                await OrganizationSeedingService.seedOrganizationData(organization.id)
            } catch (seedingError) {
                console.error('Organization seeding failed:', seedingError)
                // Consider whether to rollback organization creation or continue
                // For now, we'll log and continue, but you might want to rollback in production
            }

            // Log the action
            await UserAuditLog.logUserAction(user.id, organization.id, 'create_organization', {
                entityType: 'organization',
                entityId: organization.id,
                details: { name: organization.name, type: organization.type },
                ipAddress: request.ip(),
                userAgent: request.header('user-agent')
            })

            return response.created({
                organization: organization.toJSON(),
                message: 'Organization created successfully'
            })
        } catch (error) {
            return response.badRequest({ message: 'Failed to create organization', error: error.message })
        }
    }

    /**
     * Update an organization
     */
    async update({ params, request, response, auth }: HttpContext) {
        try {
            const user = await auth.getUserOrFail()
            const organizationId = params.id

            // Check access permissions
            const hasAccess = await this.checkOrganizationAccess(user, organizationId)
            if (!hasAccess) {
                return response.forbidden({ message: 'Access denied to this organization.' })
            }

            const organization = await Organization.findOrFail(organizationId)
            const beforeState = organization.toJSON()

            const payload = await request.validateUsing(updateOrganizationValidator)

            organization.merge(payload)
            await organization.save()

            // Log the action
            await UserAuditLog.logUserAction(user.id, organization.id, 'update_organization', {
                entityType: 'organization',
                entityId: organization.id,
                beforeState,
                afterState: organization.toJSON(),
                ipAddress: request.ip(),
                userAgent: request.header('user-agent')
            })

            return response.ok({
                organization: organization.toJSON(),
                message: 'Organization updated successfully'
            })
        } catch (error) {
            return response.badRequest({ message: 'Failed to update organization', error: error.message })
        }
    }

    /**
     * Delete an organization
     */
    async destroy({ params, response, auth }: HttpContext) {
        try {
            const user = await auth.getUserOrFail()
            const organizationId = params.id

            // Check if user is super admin
            const isSuperAdmin = await this.isSuperAdmin(user)
            if (!isSuperAdmin) {
                return response.forbidden({ message: 'Access denied. Super admin required.' })
            }

            const organization = await Organization.findOrFail(organizationId)

            // Check if organization has active users
            const activeUsersCount = await User.query()
                .where('organization_id', organizationId)
                .where('is_active', true)
                .count('* as total')
                .first()

            if (activeUsersCount && Number(activeUsersCount.$extras.total) > 0) {
                return response.badRequest({
                    message: 'Cannot delete organization with active users. Please deactivate users first.'
                })
            }

            const beforeState = organization.toJSON()
            await organization.delete()

            // Log the action
            await UserAuditLog.logUserAction(user.id, null, 'delete_organization', {
                entityType: 'organization',
                entityId: organizationId,
                beforeState,
                details: { name: beforeState.name }
            })

            return response.ok({ message: 'Organization deleted successfully' })
        } catch (error) {
            return response.badRequest({ message: 'Failed to delete organization', error: error.message })
        }
    }

    /**
     * Get organization statistics
     */
    async stats({ params, response, auth }: HttpContext) {
        try {
            const user = await auth.getUserOrFail()
            const organizationId = params.id

            // Check access permissions
            const hasAccess = await this.checkOrganizationAccess(user, organizationId)
            if (!hasAccess) {
                return response.forbidden({ message: 'Access denied to this organization.' })
            }

            // Get user statistics
            const totalUsersCount = await User.query()
                .where('organization_id', organizationId)
                .count('* as total')
                .first()

            const activeUsersCount = await User.query()
                .where('organization_id', organizationId)
                .where('is_active', true)
                .count('* as total')
                .first()

            const usersByRole = await User.query()
                .where('organization_id', organizationId)
                .where('is_active', true)
                .whereHas('roles', (roleQuery) => {
                    roleQuery.where('is_active', true)
                })
                .preload('roles')

            // Count roles
            const totalRolesCount = await Role.query()
                .where('organization_id', organizationId)
                .where('is_active', true)
                .count('* as total')
                .first()

            // Recent activity
            const recentActivity = await UserAuditLog.query()
                .where('organization_id', organizationId)
                .preload('user')
                .orderBy('created_at', 'desc')
                .limit(10)

            const roleDistribution = usersByRole.reduce((acc, user) => {
                user.roles.forEach(role => {
                    acc[role.displayName] = (acc[role.displayName] || 0) + 1
                })
                return acc
            }, {} as Record<string, number>)

            return response.ok({
                stats: {
                    totalUsers: Number(totalUsersCount?.$extras.total || 0),
                    activeUsers: Number(activeUsersCount?.$extras.total || 0),
                    totalRoles: Number(totalRolesCount?.$extras.total || 0),
                    roleDistribution,
                    recentActivity: recentActivity.map(log => ({
                        id: log.id,
                        action: log.action,
                        user: log.user?.name || 'System',
                        createdAt: log.createdAt
                    }))
                },
                message: 'Organization statistics fetched successfully'
            })
        } catch (error) {
            return response.badRequest({ message: 'Failed to fetch organization statistics', error: error.message })
        }
    }

    /**
     * Helper method to check if user is super admin
     */
    private async isSuperAdmin(user: User): Promise<boolean> {
        const permissions = await user.getUserPermissions()
        return permissions.some(p => p.module === '*' && p.actions.includes('*'))
    }

    /**
     * Helper method to check organization access
     */
    private async checkOrganizationAccess(user: User, organizationId: string): Promise<boolean> {
        const isSuperAdmin = await this.isSuperAdmin(user)
        if (isSuperAdmin) return true

        return user.belongsToOrganization(organizationId)
    }
}
