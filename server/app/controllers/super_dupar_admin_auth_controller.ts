import type { HttpContext } from '@adonisjs/core/http'
import SuperDuparAdmin from '#models/super_dupar_admin'
import User from '#models/user'
import Organization from '#models/organization'
import { DateTime } from 'luxon'

// Extend HttpContext to include superDuparAdmin
declare module '@adonisjs/core/http' {
    interface HttpContext {
        superDuparAdmin?: SuperDuparAdmin
    }
}

export default class SuperDuparAdminAuthController {
    /**
     * Handle super dupar admin login
     */
    async login({ request, response }: HttpContext) {
        try {
            const { email, password } = request.only(['email', 'password'])

            if (!email || !password) {
                return response.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                })
            }

            // Find super dupar admin by email
            const superDuparAdmin = await SuperDuparAdmin.findBy('email', email)

            if (!superDuparAdmin) {
                return response.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                })
            }

            // Check if account is active
            if (!superDuparAdmin.isActive) {
                return response.status(401).json({
                    success: false,
                    message: 'Account is deactivated'
                })
            }

            // Verify password
            const isValid = await superDuparAdmin.comparePassword(password)
            if (!isValid) {
                return response.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                })
            }

            // Generate access token
            const token = await SuperDuparAdmin.accessTokens.create(superDuparAdmin, ['*'], {
                expiresIn: '7d'
            })

            // Update last login
            superDuparAdmin.lastLoginAt = DateTime.now()
            await superDuparAdmin.save()

            // Log activity
            await superDuparAdmin.logActivity('login', {
                ipAddress: request.ip(),
                userAgent: request.header('User-Agent'),
                details: {
                    loginTime: DateTime.now().toISO()
                }
            })

            return response.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: superDuparAdmin.id,
                        email: superDuparAdmin.email,
                        name: superDuparAdmin.name,
                        phone: superDuparAdmin.phone,
                        isActive: superDuparAdmin.isActive,
                        lastLoginAt: superDuparAdmin.lastLoginAt,
                        role: 'super_dupar_admin',
                        permissions: ['super_dupar.*']
                    },
                    token: {
                        type: 'Bearer',
                        token: token.value!.release(),
                        expiresAt: token.expiresAt
                    }
                }
            })

        } catch (error) {
            console.error('Super Dupar Admin login error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error during login'
            })
        }
    }

    /**
     * Handle super dupar admin logout
     */
    async logout({ response }: HttpContext) {
        try {
            return response.status(200).json({
                success: true,
                message: 'Logout successful'
            })

        } catch (error) {
            console.error('Super Dupar Admin logout error:', error)
            return response.status(200).json({
                success: true,
                message: 'Logout completed'
            })
        }
    }

    /**
     * Get current super dupar admin profile
     */
    async me({ superDuparAdmin, response }: HttpContext) {
        try {
            if (!superDuparAdmin) {
                return response.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                })
            }

            return response.status(200).json({
                success: true,
                data: {
                    user: {
                        id: superDuparAdmin.id,
                        email: superDuparAdmin.email,
                        name: superDuparAdmin.name,
                        phone: superDuparAdmin.phone,
                        isActive: superDuparAdmin.isActive,
                        lastLoginAt: superDuparAdmin.lastLoginAt,
                        role: 'super_dupar_admin',
                        permissions: ['super_dupar.*'],
                        settings: superDuparAdmin.settings,
                        createdAt: superDuparAdmin.createdAt,
                        updatedAt: superDuparAdmin.updatedAt
                    }
                }
            })

        } catch (error) {
            console.error('Super Dupar Admin me error:', error)
            return response.status(401).json({
                success: false,
                message: 'Unauthorized'
            })
        }
    }

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
}
