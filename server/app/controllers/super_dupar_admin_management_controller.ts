import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Organization from '#models/organization'
import Role from '#models/role'
import OrganizationSeedingService from '#services/organization_seeding_service'
import { DateTime } from 'luxon'

export default class SuperDuparAdminManagementController {
    /**
     * Dashboard statistics for super dupar admin
     */
    async dashboardStats({ response }: HttpContext) {
        try {
            // Get organization count
            const totalOrganizations = await Organization.query().count('* as total')
            const activeOrganizations = await Organization.query().where('status', 'active').count('* as total')

            // Get super admin count
            const totalSuperAdmins = await User.query()
                .whereHas('roles', (roleQuery) => {
                    roleQuery.where('name', 'super_admin')
                })
                .count('* as total')

            // Get active super admin count
            const activeSuperAdmins = await User.query()
                .where('is_active', true)
                .whereHas('roles', (roleQuery) => {
                    roleQuery.where('name', 'super_admin')
                })
                .count('* as total')

            // Get total users count
            const totalUsers = await User.query().count('* as total')
            const activeUsers = await User.query().where('is_active', true).count('* as total')

            return response.status(200).json({
                success: true,
                data: {
                    organizations: {
                        total: Number(totalOrganizations[0].$extras.total),
                        active: Number(activeOrganizations[0].$extras.total)
                    },
                    superAdmins: {
                        total: Number(totalSuperAdmins[0].$extras.total),
                        active: Number(activeSuperAdmins[0].$extras.total)
                    },
                    users: {
                        total: Number(totalUsers[0].$extras.total),
                        active: Number(activeUsers[0].$extras.total)
                    }
                }
            })

        } catch (error) {
            console.error('Dashboard stats error:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to fetch dashboard statistics'
            })
        }
    }

    /**
     * Get super admins management data
     */
    async getSuperAdmins({ request, response }: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('limit', 10)
            const search = request.input('search', '')
            const organizationId = request.input('organization_id')

            let query = User.query()
                .whereHas('roles', (roleQuery) => {
                    roleQuery.where('name', 'super_admin')
                })
                .preload('organization')
                .preload('roles')

            // Search filter
            if (search) {
                query.where((builder) => {
                    builder.where('name', 'ILIKE', `%${search}%`)
                        .orWhere('email', 'ILIKE', `%${search}%`)
                })
            }

            // Organization filter
            if (organizationId) {
                query.where('organization_id', organizationId)
            }

            const superAdmins = await query.paginate(page, limit)

            return response.status(200).json({
                success: true,
                data: superAdmins.serialize()
            })

        } catch (error) {
            console.error('Get super admins error:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to fetch super admins'
            })
        }
    }

    /**
     * Create a new organization with its super admin
     */
    async createOrganizationWithSuperAdmin({ request, response, superDuparAdmin }: HttpContext) {
        try {
            const {
                // Organization data
                organizationName,
                organizationType,
                registrationNumber,
                address,
                phone: orgPhone,
                email: orgEmail,
                website,
                timezone,
                currency,
                language,
                // Super admin data
                email,
                password,
                name,
                phone,
                department,
                employeeId
            } = request.only([
                'organizationName',
                'organizationType', 
                'registrationNumber',
                'address',
                'orgPhone',
                'orgEmail',
                'website',
                'timezone',
                'currency',
                'language',
                'email',
                'password',
                'name',
                'phone',
                'department',
                'employeeId'
            ])

            // Validation
            if (!organizationName || !email || !password || !name) {
                return response.status(400).json({
                    success: false,
                    message: 'Organization name, super admin email, password, and name are required'
                })
            }

            // Check if email already exists
            const existingUser = await User.findBy('email', email)
            if (existingUser) {
                return response.status(400).json({
                    success: false,
                    message: 'User with this email already exists'
                })
            }

            // Create organization
            const organization = await Organization.create({
                name: organizationName,
                type: organizationType || 'hospital',
                registrationNumber,
                address,
                phone: orgPhone,
                email: orgEmail,
                website,
                status: 'active',
                timezone: timezone || 'UTC',
                currency: currency || 'USD',
                language: language || 'en',
                settings: {},
                branding: {}
            })

            // Seed organization data with system defaults
            try {
                await OrganizationSeedingService.seedOrganizationData(organization.id)
            } catch (seedingError) {
                console.error('Organization seeding failed:', seedingError)
                // In case of seeding failure, we should probably rollback organization creation
                await organization.delete()
                return response.status(500).json({
                    success: false,
                    message: 'Failed to initialize organization data. Please try again.'
                })
            }

            // Get organization-specific super admin role
            const superAdminRole = await Role.query()
                .where('name', 'super_admin')
                .where('organization_id', organization.id)
                .first()

            if (!superAdminRole) {
                // Fallback to system super admin role
                const systemSuperAdminRole = await Role.query()
                    .where('name', 'super_admin')
                    .whereNull('organization_id')
                    .first()
                
                if (!systemSuperAdminRole) {
                    await organization.delete()
                    return response.status(500).json({
                        success: false,
                        message: 'Super admin role not found'
                    })
                }
                
                // Create super admin user with system role for now
                const user = await User.create({
                    email,
                    passwordHash: password, 
                    name,
                    phone,
                    department,
                    employeeId,
                    organizationId: organization.id,
                    roleId: systemSuperAdminRole.id,
                    isActive: true,
                    isForDemoPurpose: false
                })

                // Assign super admin role via many-to-many relationship
                await user.related('roles').attach({
                    [systemSuperAdminRole.id]: {
                        assigned_at: DateTime.now(),
                        assigned_by: superDuparAdmin?.id,
                        is_active: true
                    }
                })

                // Load the created user with relations
                await user.load('organization')
                await user.load('roles')

                // Log activity
                if (superDuparAdmin) {
                    await superDuparAdmin.logActivity('create_organization_with_super_admin', {
                        entityType: 'organization',
                        entityId: organization.id,
                        details: {
                            organizationName: organization.name,
                            superAdminEmail: user.email,
                            superAdminName: user.name
                        }
                    })
                }

                return response.status(201).json({
                    success: true,
                    message: 'Organization and super admin created successfully',
                    data: {
                        organization: organization.serialize(),
                        superAdmin: {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            phone: user.phone,
                            department: user.department,
                            employeeId: user.employeeId,
                            organization: user.organization,
                            roles: user.roles,
                            isActive: user.isActive,
                            createdAt: user.createdAt
                        }
                    }
                })
            }

            // Create super admin with organization-specific role
            const user = await User.create({
                email,
                passwordHash: password,
                name,
                phone,
                department,
                employeeId,
                organizationId: organization.id,
                roleId: superAdminRole.id,
                isActive: true,
                isForDemoPurpose: false
            })

            // Assign super admin role via many-to-many relationship
            await user.related('roles').attach({
                [superAdminRole.id]: {
                    assigned_at: DateTime.now(),
                    assigned_by: superDuparAdmin?.id,
                    is_active: true
                }
            })

            // Load the created user with relations
            await user.load('organization')
            await user.load('roles')

            // Log activity
            if (superDuparAdmin) {
                await superDuparAdmin.logActivity('create_organization_with_super_admin', {
                    entityType: 'organization',
                    entityId: organization.id,
                    details: {
                        organizationName: organization.name,
                        superAdminEmail: user.email,
                        superAdminName: user.name
                    }
                })
            }

            return response.status(201).json({
                success: true,
                message: 'Organization and super admin created successfully',
                data: {
                    organization: organization.serialize(),
                    superAdmin: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        phone: user.phone,
                        department: user.department,
                        employeeId: user.employeeId,
                        organization: user.organization,
                        roles: user.roles,
                        isActive: user.isActive,
                        createdAt: user.createdAt
                    }
                }
            })

        } catch (error) {
            console.error('Create organization with super admin error:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to create organization and super admin'
            })
        }
    }

    /**
     * Create a new super admin
     */
    async createSuperAdmin({ request, response, superDuparAdmin }: HttpContext) {
        try {
            const {
                email,
                password,
                name,
                phone,
                department,
                employeeId,
                organizationId
            } = request.only([
                'email',
                'password',
                'name',
                'phone',
                'department',
                'employeeId',
                'organizationId'
            ])

            // Validation
            if (!email || !password || !name || !organizationId) {
                return response.status(400).json({
                    success: false,
                    message: 'Email, password, name, and organization are required'
                })
            }

            // Check if email already exists
            const existingUser = await User.findBy('email', email)
            if (existingUser) {
                return response.status(400).json({
                    success: false,
                    message: 'User with this email already exists'
                })
            }

            // Check if organization exists
            const organization = await Organization.find(organizationId)
            if (!organization) {
                return response.status(400).json({
                    success: false,
                    message: 'Organization not found'
                })
            }

            // Get super admin role
            const superAdminRole = await Role.findBy('name', 'super_admin')
            if (!superAdminRole) {
                return response.status(500).json({
                    success: false,
                    message: 'Super admin role not found'
                })
            }

            // Create user
            const user = await User.create({
                email,
                passwordHash: password, // Will be hashed by model hook
                name,
                phone,
                department,
                employeeId,
                organizationId,
                roleId: superAdminRole.id,
                isActive: true,
                isForDemoPurpose: false
            })

            // Assign super admin role via many-to-many relationship
            await user.related('roles').attach({
                [superAdminRole.id]: {
                    assigned_at: DateTime.now(),
                    assigned_by: superDuparAdmin?.id,
                    is_active: true
                }
            })

            // Load the created user with relations
            await user.load('organization')
            await user.load('roles')

            // Log activity
            if (superDuparAdmin) {
                await superDuparAdmin.logActivity('create_super_admin', {
                    entityType: 'user',
                    entityId: user.id,
                    details: {
                        email: user.email,
                        name: user.name,
                        organizationId: user.organizationId
                    }
                })
            }

            return response.status(201).json({
                success: true,
                message: 'Super admin created successfully',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        phone: user.phone,
                        department: user.department,
                        employeeId: user.employeeId,
                        organizationId: user.organizationId,
                        organization: user.organization,
                        roles: user.roles,
                        isActive: user.isActive,
                        createdAt: user.createdAt
                    }
                }
            })

        } catch (error) {
            console.error('Create super admin error:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to create super admin'
            })
        }
    }

    /**
     * Update super admin
     */
    async updateSuperAdmin({ request, response, superDuparAdmin, params }: HttpContext) {
        try {
            const userId = params.id
            const {
                name,
                phone,
                department,
                employeeId,
                isActive
            } = request.only([
                'name',
                'phone',
                'department',
                'employeeId',
                'isActive'
            ])

            // Find the user
            const user = await User.query()
                .where('id', userId)
                .whereHas('roles', (roleQuery) => {
                    roleQuery.where('name', 'super_admin')
                })
                .preload('organization')
                .preload('roles')
                .first()

            if (!user) {
                return response.status(404).json({
                    success: false,
                    message: 'Super admin not found'
                })
            }

            const beforeState = user.serialize()

            // Update user
            if (name) user.name = name
            if (phone !== undefined) user.phone = phone
            if (department !== undefined) user.department = department
            if (employeeId !== undefined) user.employeeId = employeeId
            if (isActive !== undefined) user.isActive = isActive

            await user.save()
            await user.load('organization')
            await user.load('roles')

            // Log activity
            if (superDuparAdmin) {
                await superDuparAdmin.logActivity('update_super_admin', {
                    entityType: 'user',
                    entityId: user.id,
                    beforeState,
                    afterState: user.serialize(),
                    details: {
                        updatedFields: Object.keys(request.only([
                            'name', 'phone', 'department', 'employeeId', 'isActive'
                        ]))
                    }
                })
            }

            return response.status(200).json({
                success: true,
                message: 'Super admin updated successfully',
                data: {
                    user: user.serialize()
                }
            })

        } catch (error) {
            console.error('Update super admin error:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to update super admin'
            })
        }
    }

    /**
     * Suspend/Activate super admin
     */
    async toggleSuperAdminStatus({ request, response, superDuparAdmin, params }: HttpContext) {
        try {
            const userId = params.id
            const { isActive } = request.only(['isActive'])

            // Find the user
            const user = await User.query()
                .where('id', userId)
                .whereHas('roles', (roleQuery) => {
                    roleQuery.where('name', 'super_admin')
                })
                .preload('organization')
                .first()

            if (!user) {
                return response.status(404).json({
                    success: false,
                    message: 'Super admin not found'
                })
            }

            const beforeState = { isActive: user.isActive }
            user.isActive = isActive
            await user.save()

            // Log activity
            if (superDuparAdmin) {
                await superDuparAdmin.logActivity(isActive ? 'activate_super_admin' : 'suspend_super_admin', {
                    entityType: 'user',
                    entityId: user.id,
                    beforeState,
                    afterState: { isActive: user.isActive },
                    details: {
                        email: user.email,
                        name: user.name,
                        organizationId: user.organizationId
                    }
                })
            }

            return response.status(200).json({
                success: true,
                message: `Super admin ${isActive ? 'activated' : 'suspended'} successfully`,
                data: {
                    user: user.serialize()
                }
            })

        } catch (error) {
            console.error('Toggle super admin status error:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to update super admin status'
            })
        }
    }

    /**
     * Get all organizations
     */
    async getOrganizations({ request, response }: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('limit', 10)
            const search = request.input('search', '')
            const status = request.input('status')

            let query = Organization.query()

            // Search filter
            if (search) {
                query.where('name', 'ILIKE', `%${search}%`)
            }

            // Status filter
            if (status) {
                query.where('status', status)
            }

            const organizations = await query.paginate(page, limit)

            return response.status(200).json({
                success: true,
                data: organizations.serialize()
            })

        } catch (error) {
            console.error('Get organizations error:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to fetch organizations'
            })
        }
    }

    /**
     * Get recent activities for super dupar admin
     */
    async getRecentActivities({ request, response, superDuparAdmin }: HttpContext) {
        try {
            const limit = request.input('limit', 20)

            if (!superDuparAdmin) {
                return response.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                })
            }

            const activities = await superDuparAdmin.getRecentActivities(limit)

            return response.status(200).json({
                success: true,
                data: activities
            })

        } catch (error) {
            console.error('Get recent activities error:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to fetch recent activities'
            })
        }
    }
}
