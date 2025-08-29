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

            // Find user by email
            const user = await User.findBy('email', payload.email)
            if (!user) {
                return response.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
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
                    message: 'Invalid credentials'
                })
            }

            // Generate access token
            const token = await User.accessTokens.create(user, ['*'], {
                expiresIn: '7d'
            })

            // Update last login
            user.lastLogin = DateTime.now()
            await user.save()

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
                        permissions: user.permissions,
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
            user.role = payload.role
            user.phone = payload.phone
            user.department = payload.department
            user.employeeId = payload.employeeId
            user.isActive = true

            await user.save()

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
                        permissions: user.permissions,
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
            const user = auth.getUserOrFail()
            const token = auth.user?.currentAccessToken

            if (token) {
                await User.accessTokens.delete(user, token.identifier)
            }

            return response.status(200).json({
                success: true,
                message: 'Logout successful'
            })

        } catch (error) {
            console.error('Logout error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error during logout'
            })
        }
    }

    /**
     * Get current user profile
     */
    async me({ auth, response }: HttpContext) {
        try {
            const user = auth.getUserOrFail()

            return response.status(200).json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        permissions: user.permissions,
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
}