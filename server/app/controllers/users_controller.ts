import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { updateUserValidator } from '#validators/user'

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