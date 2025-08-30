import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { updateUserValidator, createUserValidator } from '#validators/user'
import Database from '@adonisjs/lucid/services/db'
import { v4 as uuid } from 'uuid'
import hash from '@adonisjs/core/services/hash'

export default class UsersController {
    /**
     * Get all users with pagination and search
     */
    async index({ request, response }: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('limit', 10)
            const search = request.input('search', '')

            let query = User.query().preload('role', (roleQuery) => {
                roleQuery.preload('permissions')
            })

            if (search) {
                query = query.where((builder) => {
                    builder
                        .where('name', 'like', `%${search}%`)
                        .orWhere('email', 'like', `%${search}%`)
                })
            }

            const users = await query.paginate(page, limit)

            return response.status(200).json({
                success: true,
                data: users,
                message: 'Users retrieved successfully'
            })

        } catch (error) {
            console.error('Users index error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving users'
            })
        }
    }

    /**
     * Get single user by ID
     */
    async show({ params, response }: HttpContext) {
        try {
            const user = await User.query()
                .where('id', params.id)
                .preload('role', (roleQuery) => {
                    roleQuery.preload('permissions')
                })
                .first()

            if (!user) {
                return response.status(404).json({
                    success: false,
                    message: 'User not found'
                })
            }

            return response.status(200).json({
                success: true,
                data: user,
                message: 'User retrieved successfully'
            })

        } catch (error) {
            console.error('User show error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving user'
            })
        }
    }

    /**
     * Create a new user with auto-generated employee code
     */
    async store({ request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(createUserValidator)

            // Generate unique employee ID
            const employeeId = await this.generateEmployeeId()

            // Hash the password
            const hashedPassword = await hash.make(payload.password)

            // Create user
            const user = new User()
            user.id = uuid()
            user.email = payload.email
            user.passwordHash = hashedPassword
            user.name = payload.name
            user.roleId = payload.roleId
            user.phone = payload.phone || null
            user.department = payload.department || null
            user.employeeId = employeeId
            user.isActive = payload.isActive ?? true

            await user.save()

            // Load the created user with role and permissions
            await user.load('role', (roleQuery) => {
                roleQuery.preload('permissions')
            })

            return response.status(201).json({
                success: true,
                data: user,
                message: 'User created successfully'
            })

        } catch (error) {
            console.error('User store error:', error)

            if (error.code === 'E_VALIDATION_ERROR') {
                return response.status(422).json({
                    success: false,
                    message: 'Validation failed',
                    errors: error.messages
                })
            }

            if (error.code === '23505') { // PostgreSQL unique constraint violation
                return response.status(409).json({
                    success: false,
                    message: 'Email already exists'
                })
            }

            return response.status(500).json({
                success: false,
                message: 'Server error while creating user'
            })
        }
    }

    /**
     * Generate unique employee ID
     */
    private async generateEmployeeId(): Promise<string> {
        const currentYear = new Date().getFullYear()
        const prefix = `EMP${currentYear}`

        // Get the latest employee ID for the current year
        const latestUser = await Database
            .from('users')
            .where('employee_id', 'like', `${prefix}%`)
            .orderBy('employee_id', 'desc')
            .first()

        if (!latestUser) {
            return `${prefix}001`
        }

        // Extract the numeric part and increment
        const lastId = latestUser.employee_id
        const numericPart = lastId.replace(prefix, '')
        const nextNumber = parseInt(numericPart) + 1

        // Pad with zeros to maintain 3-digit format
        return `${prefix}${nextNumber.toString().padStart(3, '0')}`
    }

    /**
     * Update user by ID
     */
    async update({ params, request, response }: HttpContext) {
        try {
            const user = await User.find(params.id)

            if (!user) {
                return response.status(404).json({
                    success: false,
                    message: 'User not found'
                })
            }

            const payload = await request.validateUsing(updateUserValidator)

            // Handle password update if provided
            if (payload.password) {
                const hashedPassword = await hash.make(payload.password)
                user.passwordHash = hashedPassword
                // Remove password from payload to avoid merge issues
                delete payload.password
            }

            // Update user fields
            user.merge(payload)
            await user.save()

            // Load the updated user with role and permissions
            await user.load('role', (roleQuery) => {
                roleQuery.preload('permissions')
            })

            return response.status(200).json({
                success: true,
                data: user,
                message: 'User updated successfully'
            })

        } catch (error) {
            console.error('User update error:', error)

            if (error.code === 'E_VALIDATION_ERROR') {
                return response.status(422).json({
                    success: false,
                    message: 'Validation failed',
                    errors: error.messages
                })
            }

            return response.status(500).json({
                success: false,
                message: 'Server error while updating user'
            })
        }
    }

    /**
     * Delete user by ID
     */
    async destroy({ params, response }: HttpContext) {
        try {
            const user = await User.find(params.id)

            if (!user) {
                return response.status(404).json({
                    success: false,
                    message: 'User not found'
                })
            }

            await user.delete()

            return response.status(200).json({
                success: true,
                message: 'User deleted successfully'
            })

        } catch (error) {
            console.error('User destroy error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while deleting user'
            })
        }
    }
}