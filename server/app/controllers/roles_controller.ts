import type { HttpContext } from '@adonisjs/core/http'
import Role from '#models/role'
import Permission from '#models/permission'
import UserAuditLog from '#models/user_audit_log'
import { createRoleValidator, updateRoleValidator } from '#validators/role'
import User from '#models/user'

export default class RolesController {
    /**
     * Display a list of all roles with organization context
     */
    async index({ request, response, auth }: HttpContext) {
        try {
            const user = await auth.getUserOrFail()
            const organizationId = request.input('organization_id', user.organizationId)
            const includeGlobal = request.input('include_global', true)

            let query = Role.query()
                .preload('permissions')
                .preload('organization')
                .withCount('assignedUsers')
                .orderBy('access_level', 'desc')

            // Organization-based filtering
            if (organizationId && includeGlobal) {
                query.where((builder) => {
                    builder.where('organization_id', organizationId)
                           .orWhereNull('organization_id')
                })
            } else if (organizationId) {
                query.where('organization_id', organizationId)
            } else if (!await this.isSuperAdmin(user)) {
                            // Apply organization filtering based on user type
            if (!(await this.isSuperAdmin(user))) {
                if (user.organizationId) {
                    query.where('organization_id', user.organizationId)
                } else {
                    return response.badRequest({
                        success: false,
                        message: 'User organization not found'
                    })
                }
            }
            }

            const roles = await query

            // Transform the data to include counts and metadata
            const rolesWithMetadata = roles.map(role => {
                const roleData = role.serialize()
                return {
                    ...roleData,
                    userCount: role.$extras.assigned_users_count || 0,
                    isGlobal: !role.organizationId,
                    canEdit: this.canEditRole(role, user),
                    canDelete: this.canDeleteRole(role, user)
                }
            })

            return response.ok({
                success: true,
                data: rolesWithMetadata,
                pagination: {
                    total: roles.length
                }
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
    async edit({ }: HttpContext) { }

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
     * Get role templates for quick role creation
     */
    async getTemplates({ response }: HttpContext) {
        try {
            const templates = [
                {
                    id: 'doctor',
                    name: 'Doctor',
                    displayName: 'Doctor',
                    description: 'Medical practitioner with patient care access',
                    accessLevel: 80,
                    permissions: ['patients.*', 'appointments.*', 'medical_records.*', 'lab_tests.read', 'lab_tests.create']
                },
                {
                    id: 'nurse',
                    name: 'Nurse', 
                    displayName: 'Nurse',
                    description: 'Nursing staff with patient care support',
                    accessLevel: 70,
                    permissions: ['patients.read', 'patients.update', 'appointments.read', 'medical_records.read', 'medical_records.create']
                },
                {
                    id: 'receptionist',
                    name: 'Receptionist',
                    displayName: 'Receptionist',
                    description: 'Front desk and appointment management',
                    accessLevel: 50,
                    permissions: ['patients.read', 'patients.create', 'appointments.*', 'billing.read']
                },
                {
                    id: 'lab_technician',
                    name: 'Lab Technician',
                    displayName: 'Lab Technician',
                    description: 'Laboratory tests and reports management',
                    accessLevel: 60,
                    permissions: ['lab_tests.*', 'patients.read', 'medical_records.read']
                },
                {
                    id: 'pharmacist',
                    name: 'Pharmacist',
                    displayName: 'Pharmacist',
                    description: 'Pharmacy and medication management',
                    accessLevel: 65,
                    permissions: ['inventory.*', 'prescriptions.*', 'patients.read']
                },
                {
                    id: 'billing_manager',
                    name: 'Billing Manager',
                    displayName: 'Billing Manager',
                    description: 'Financial and billing operations',
                    accessLevel: 75,
                    permissions: ['billing.*', 'patients.read', 'appointments.read', 'reports.read']
                }
            ]

            return response.ok({
                success: true,
                data: templates
            })
        } catch (error) {
            return response.badRequest({
                success: false,
                message: 'Failed to fetch role templates',
                error: error.message
            })
        }
    }

    /**
     * Create role from template
     */
    async createFromTemplate({ request, response, auth }: HttpContext) {
        try {
            const user = await auth.getUserOrFail()
            const { templateId, customizations } = request.only(['templateId', 'customizations'])

            // Get template data (in real app, this might come from database)
            const templates = await this.getTemplateData()
            const template = templates.find(t => t.id === templateId)

            if (!template) {
                return response.notFound({
                    success: false,
                    message: 'Template not found'
                })
            }

            // Create role with template data + customizations
            const roleData = {
                ...template,
                ...customizations,
                organizationId: user.organizationId,
                isSystemRole: false
            }

            delete roleData.id // Remove template ID
            delete roleData.permissions // Handle permissions separately

            const role = await Role.create(roleData)

            // Assign permissions from template
            if (template.permissions && template.permissions.length > 0) {
                for (const permissionName of template.permissions) {
                    const permission = await Permission.query()
                        .where('name', 'like', permissionName.replace('*', '%'))
                        .first()
                    
                    if (permission) {
                        await role.related('permissions').attach({
                            [permission.id]: { 
                                actions: JSON.stringify(this.parsePermissionActions(permissionName))
                            }
                        })
                    }
                }
            }

            await role.load('permissions')

            // Log the action
            await UserAuditLog.logUserAction(user.id, user.organizationId, 'create_role_from_template', {
                entityType: 'role',
                entityId: role.id,
                details: { templateId, roleName: role.name }
            })

            return response.created({
                success: true,
                data: role,
                message: 'Role created from template successfully'
            })
        } catch (error) {
            return response.badRequest({
                success: false,
                message: 'Failed to create role from template',
                error: error.message
            })
        }
    }

    /**
     * Bulk operations for roles
     */
    async bulkOperation({ request, response, auth }: HttpContext) {
        try {
            const user = await auth.getUserOrFail()
            const { operation, roleIds, data } = request.only(['operation', 'roleIds', 'data'])

            if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
                return response.badRequest({
                    success: false,
                    message: 'Role IDs are required'
                })
            }

            const results = []

            switch (operation) {
                case 'delete':
                    for (const roleId of roleIds) {
                        try {
                            const role = await Role.findOrFail(roleId)
                            
                            // Check permissions and constraints
                            if (role.isSystemRole) {
                                results.push({ roleId, success: false, message: 'System role cannot be deleted' })
                                continue
                            }

                            await role.load('assignedUsers')
                            if (role.assignedUsers.length > 0) {
                                results.push({ roleId, success: false, message: 'Role has assigned users' })
                                continue
                            }

                            await role.delete()
                            results.push({ roleId, success: true, message: 'Role deleted' })
                        } catch (error) {
                            results.push({ roleId, success: false, message: error.message })
                        }
                    }
                    break

                case 'activate':
                case 'deactivate':
                    const isActive = operation === 'activate'
                    for (const roleId of roleIds) {
                        try {
                            const role = await Role.findOrFail(roleId)
                            role.isActive = isActive
                            await role.save()
                            results.push({ roleId, success: true, message: `Role ${operation}d` })
                        } catch (error) {
                            results.push({ roleId, success: false, message: error.message })
                        }
                    }
                    break

                case 'update_permissions':
                    for (const roleId of roleIds) {
                        try {
                            const role = await Role.findOrFail(roleId)
                            
                            if (data.permissions) {
                                // Clear existing permissions and add new ones
                                await role.related('permissions').detach()
                                
                                for (const permissionData of data.permissions) {
                                    await role.related('permissions').attach({
                                        [permissionData.permissionId]: {
                                            actions: JSON.stringify(permissionData.actions)
                                        }
                                    })
                                }
                            }
                            
                            results.push({ roleId, success: true, message: 'Permissions updated' })
                        } catch (error) {
                            results.push({ roleId, success: false, message: error.message })
                        }
                    }
                    break

                default:
                    return response.badRequest({
                        success: false,
                        message: 'Invalid operation'
                    })
            }

            // Log bulk operation
            await UserAuditLog.logUserAction(user.id, user.organizationId, `bulk_role_${operation}`, {
                entityType: 'role',
                details: { roleIds, operation, results: results.length }
            })

            return response.ok({
                success: true,
                data: results,
                message: `Bulk ${operation} completed`
            })
        } catch (error) {
            return response.badRequest({
                success: false,
                message: 'Bulk operation failed',
                error: error.message
            })
        }
    }

    // Helper methods
    private async isSuperAdmin(user: User): Promise<boolean> {
        const permissions = await user.getUserPermissions()
        return permissions.some(p => p.module === 'system' && p.actions.includes('*'))
    }

    private canEditRole(role: Role, user: User): boolean {
        // System roles can only be edited by super admins
        if (role.isSystemRole) {
            return false // This would need super admin check
        }
        
        // Organization roles can be edited by org admins
        return role.organizationId === user.organizationId
    }

    private canDeleteRole(role: Role, user: User): boolean {
        // System roles cannot be deleted
        if (role.isSystemRole) {
            return false
        }
        
        // Organization roles can be deleted by org admins
        return role.organizationId === user.organizationId
    }

    private async getTemplateData() {
        return [
            {
                id: 'doctor',
                name: 'doctor',
                displayName: 'Doctor',
                description: 'Medical practitioner with patient care access',
                accessLevel: 80,
                permissions: ['patients.*', 'appointments.*', 'medical_records.*', 'lab_tests.read', 'lab_tests.create']
            },
            {
                id: 'nurse',
                name: 'nurse',
                displayName: 'Nurse',
                description: 'Nursing staff with patient care support',
                accessLevel: 70,
                permissions: ['patients.read', 'patients.update', 'appointments.read', 'medical_records.read', 'medical_records.create']
            },
            {
                id: 'receptionist',
                name: 'receptionist',
                displayName: 'Receptionist',
                description: 'Front desk and appointment management',
                accessLevel: 50,
                permissions: ['patients.read', 'patients.create', 'appointments.*', 'billing.read']
            },
            {
                id: 'lab_technician',
                name: 'lab_technician',
                displayName: 'Lab Technician',
                description: 'Laboratory tests and reports management',
                accessLevel: 60,
                permissions: ['lab_tests.*', 'patients.read', 'medical_records.read']
            },
            {
                id: 'pharmacist',
                name: 'pharmacist',
                displayName: 'Pharmacist',
                description: 'Pharmacy and medication management',
                accessLevel: 65,
                permissions: ['inventory.*', 'prescriptions.*', 'patients.read']
            },
            {
                id: 'billing_manager',
                name: 'billing_manager',
                displayName: 'Billing Manager',
                description: 'Financial and billing operations',
                accessLevel: 75,
                permissions: ['billing.*', 'patients.read', 'appointments.read', 'reports.read']
            }
        ]
    }

    private parsePermissionActions(permissionName: string): string[] {
        if (permissionName.includes('*')) {
            return ['read', 'create', 'update', 'delete']
        }
        
        const parts = permissionName.split('.')
        if (parts.length === 2) {
            return [parts[1]]
        }
        
        return ['read']
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
