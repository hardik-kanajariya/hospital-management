import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { v4 as uuid } from 'uuid'
import { DateTime } from 'luxon'
import { loginValidator, registerValidator, refreshTokenValidator } from '#validators/auth'

export default class AuthController {
    /**
     * Handle user login
     */
    async login({ request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(loginValidator)

            // Find user by email and load role with permissions
            const user = await User.query()
                .where('email', payload.email)
                .preload('role', (roleQuery) => {
                    roleQuery.preload('permissions')
                })
                .first()

            if (!user) {
                return response.status(401).json({
                    success: false,
                    message: 'No Valid Permissons Found'
                })
            }

            // Check if user is active
            if (!user.isActive) {
                return response.status(401).json({
                    success: false,
                    message: 'Account is deactivated'
                })
            }

            // Verify password
            const isValid = await user.comparePassword(payload.password)
            if (!isValid) {
                return response.status(401).json({
                    success: false,
                    message: 'Invalid credentials password'
                })
            }

            // Generate access token
            const token = await User.accessTokens.create(user, ['*'], {
                expiresIn: '7d'
            })

            // Update last login
            user.lastLogin = DateTime.now()
            await user.save()

            // Get user permissions
            const userPermissions = await user.getUserPermissions()

            // Return response
            return response.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        roleId: user.roleId,
                        permissions: userPermissions,
                        isActive: user.isActive,
                        phone: user.phone,
                        department: user.department,
                        employeeId: user.employeeId
                    },
                    token: {
                        type: 'Bearer',
                        token: token.value!.release(),
                        expiresAt: token.expiresAt
                    }
                }
            })

        } catch (error) {
            console.error('Login error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error during login'
            })
        }
    }

    /**
     * Handle user registration
     */
    async register({ request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(registerValidator)

            // Check if user already exists
            const existingUser = await User.findBy('email', payload.email)
            if (existingUser) {
                return response.status(400).json({
                    success: false,
                    message: 'User with this email already exists'
                })
            }

            // Create user
            const user = new User()
            user.id = uuid()
            user.email = payload.email
            user.passwordHash = payload.password // Will be hashed by model hook
            user.name = payload.name
            user.roleId = payload.roleId // Use roleId instead of role
            user.phone = payload.phone || null
            user.department = payload.department || null
            user.employeeId = payload.employeeId || null
            user.isActive = true

            await user.save()

            // Load the role and permissions for response
            await user.load('role', (roleQuery) => {
                roleQuery.preload('permissions')
            })

            // Get user permissions
            const userPermissions = await user.getUserPermissions()

            // Generate access token
            const token = await User.accessTokens.create(user, ['*'], {
                expiresIn: '7d'
            })

            return response.status(201).json({
                success: true,
                message: 'User created successfully',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        roleId: user.roleId,
                        permissions: userPermissions,
                        isActive: user.isActive,
                        phone: user.phone,
                        department: user.department,
                        employeeId: user.employeeId
                    },
                    token: {
                        type: 'Bearer',
                        token: token.value!.release(),
                        expiresAt: token.expiresAt
                    }
                }
            })

        } catch (error) {
            console.error('Registration error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error during registration'
            })
        }
    }

    /**
     * Handle user logout
     */
    async logout({ auth, response }: HttpContext) {
        try {
            // Try to get the user, but don't fail if token is invalid/expired
            const user = auth.user
            const token = auth.user?.currentAccessToken

            if (user && token) {
                try {
                    await User.accessTokens.delete(user, token.identifier)
                } catch (tokenError) {
                    // Log but don't fail - token might already be expired/invalid
                    console.warn('Token deletion failed (may already be expired):', tokenError.message)
                }
            }

            // Always return success for logout - even if token was invalid
            return response.status(200).json({
                success: true,
                message: 'Logout successful'
            })

        } catch (error) {
            console.error('Logout error:', error)
            // For logout, we should still return success even if there's an error
            // The client should clear their local token regardless
            return response.status(200).json({
                success: true,
                message: 'Logout completed (token may have been expired)'
            })
        }
    }

    /**
     * Force logout (for expired tokens) - doesn't require authentication
     */
    async logoutForce({ response }: HttpContext) {
        // This endpoint doesn't require authentication
        // Client should use this when the regular logout fails due to expired token
        return response.status(200).json({
            success: true,
            message: 'Force logout successful - please clear local storage'
        })
    }

    /**
     * Get current user profile
     */
    async me({ auth, response }: HttpContext) {
        try {
            const user = auth.getUserOrFail()

            // Load role and permissions
            await user.load('role', (roleQuery) => {
                roleQuery.preload('permissions')
            })

            // Get user permissions
            const userPermissions = await user.getUserPermissions()

            return response.status(200).json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        roleId: user.roleId,
                        permissions: userPermissions,
                        isActive: user.isActive,
                        phone: user.phone,
                        department: user.department,
                        employeeId: user.employeeId,
                        lastLogin: user.lastLogin,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt
                    }
                }
            })

        } catch (error) {
            console.error('Me error:', error)
            return response.status(401).json({
                success: false,
                message: 'Unauthorized'
            })
        }
    }

    /**
     * Refresh access token
     */
    async refresh({ request, response }: HttpContext) {
        try {
            await request.validateUsing(refreshTokenValidator)

            // For now, we'll implement a simple refresh mechanism
            // In production, you might want to use refresh tokens stored in database

            return response.status(200).json({
                success: true,
                message: 'Token refresh not yet implemented',
                data: {
                    // Will implement refresh token logic here
                }
            })

        } catch (error) {
            console.error('Refresh error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error during token refresh'
            })
        }
    }

    /**
     * Verify token
     */
    async verify({ auth, response }: HttpContext) {
        try {
            const user = auth.getUserOrFail()

            return response.status(200).json({
                success: true,
                data: {
                    valid: true,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    }
                }
            })

        } catch (error) {
            return response.status(401).json({
                success: false,
                data: {
                    valid: false
                }
            })
        }
    }

    /**
     * Get demo accounts for login form
     */
    async getDemoAccounts({ response }: HttpContext) {
        try {
            const env = await import('#start/env')
            const showDemoAccounts = env.default.get('SHOW_DEMO_ACCOUNTS', 'false') === 'true'

            if (!showDemoAccounts) {
                return response.status(200).json({
                    success: true,
                    data: []
                })
            }

            // Fetch demo users with their roles
            const demoUsers = await User.query()
                .where('is_for_demo_purpose', true)
                .where('is_active', true)
                .preload('role')
                .select(['id', 'email', 'name', 'role_id'])

            const formattedDemoAccounts = demoUsers.map(user => ({
                email: user.email,
                label: user.name,
                role: user.role?.name || 'unknown',
                accessLevel: user.role?.accessLevel || 1
            }))

            return response.status(200).json({
                success: true,
                data: formattedDemoAccounts
            })

        } catch (error) {
            console.error('Demo accounts fetch error:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to fetch demo accounts',
                data: []
            })
        }
    }
}