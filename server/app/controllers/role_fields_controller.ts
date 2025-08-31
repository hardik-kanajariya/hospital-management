import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import RoleFieldService from '#services/role_field_service'

@inject()
export default class RoleFieldsController {
    constructor(private roleFieldService: RoleFieldService) { }

    /**
     * Get all fields for a specific role
     */
    async index({ params, response }: HttpContext) {
        try {
            const { roleId } = params
            const fields = await this.roleFieldService.getRoleFieldsWithOptions(roleId)

            return response.ok({
                success: true,
                data: fields
            })
        } catch (error) {
            return response.badRequest({
                success: false,
                message: error.message
            })
        }
    }

    /**
     * Get role field schema for form generation
     */
    async schema({ params, response }: HttpContext) {
        try {
            const { roleId } = params
            const schema = await this.roleFieldService.getRoleFieldSchema(roleId)

            return response.ok({
                success: true,
                data: schema
            })
        } catch (error) {
            return response.badRequest({
                success: false,
                message: error.message
            })
        }
    }

    /**
     * Create a new role field
     */
    async store({ params, request, response }: HttpContext) {
        try {
            const { roleId } = params
            const fieldData = request.only([
                'fieldName',
                'fieldLabel',
                'fieldType',
                'fieldOptions',
                'isRequired',
                'sortOrder',
                'description',
                'validationRules'
            ])

            const field = await this.roleFieldService.createRoleField(roleId, fieldData)

            return response.created({
                success: true,
                data: field
            })
        } catch (error) {
            return response.badRequest({
                success: false,
                message: error.message
            })
        }
    }

    /**
     * Update an existing role field
     */
    async update({ params, request, response }: HttpContext) {
        try {
            const { fieldId } = params
            const fieldData = request.only([
                'fieldLabel',
                'fieldType',
                'fieldOptions',
                'isRequired',
                'sortOrder',
                'description',
                'validationRules',
                'isActive'
            ])

            const field = await this.roleFieldService.updateRoleField(fieldId, fieldData)

            return response.ok({
                success: true,
                data: field
            })
        } catch (error) {
            return response.badRequest({
                success: false,
                message: error.message
            })
        }
    }

    /**
     * Delete (deactivate) a role field
     */
    async destroy({ params, response }: HttpContext) {
        try {
            const { fieldId } = params
            const field = await this.roleFieldService.deleteRoleField(fieldId)

            return response.ok({
                success: true,
                data: field
            })
        } catch (error) {
            return response.badRequest({
                success: false,
                message: error.message
            })
        }
    }

    /**
     * Bulk create role fields from template
     */
    async bulkCreate({ params, request, response }: HttpContext) {
        try {
            const { roleId } = params
            const { template } = request.only(['template'])

            if (!Array.isArray(template)) {
                return response.badRequest({
                    success: false,
                    message: 'Template must be an array of field definitions'
                })
            }

            const fields = await this.roleFieldService.createRoleFieldsFromTemplate(roleId, template)

            return response.created({
                success: true,
                data: fields
            })
        } catch (error) {
            return response.badRequest({
                success: false,
                message: error.message
            })
        }
    }

    /**
     * Create doctor role fields template
     */
    async createDoctorTemplate({ params, response }: HttpContext) {
        try {
            const { roleId } = params
            const fields = await this.roleFieldService.createDoctorRoleFields(roleId)

            return response.created({
                success: true,
                data: fields,
                message: 'Doctor role fields created successfully'
            })
        } catch (error) {
            return response.badRequest({
                success: false,
                message: error.message
            })
        }
    }

    /**
     * Set user role data
     */
    async setUserData({ request, response }: HttpContext) {
        try {
            const { userId, roleData } = request.only(['userId', 'roleData'])

            if (!userId || !roleData) {
                return response.badRequest({
                    success: false,
                    message: 'userId and roleData are required'
                })
            }

            const data = await this.roleFieldService.setUserRoleData(userId, roleData)

            return response.ok({
                success: true,
                data
            })
        } catch (error) {
            return response.badRequest({
                success: false,
                message: error.message
            })
        }
    }

    /**
     * Get user role data
     */
    async getUserData({ params, response }: HttpContext) {
        try {
            const { userId } = params
            const data = await this.roleFieldService.getUserRoleData(userId)

            return response.ok({
                success: true,
                data
            })
        } catch (error) {
            return response.badRequest({
                success: false,
                message: error.message
            })
        }
    }

    /**
     * Get users with their role data
     */
    async getUsersWithRoleData({ request, response }: HttpContext) {
        try {
            const { roleId, page = 1, limit = 20 } = request.qs()
            const result = await this.roleFieldService.getUsersWithRoleData(roleId, page, limit)

            return response.ok({
                success: true,
                ...result
            })
        } catch (error) {
            return response.badRequest({
                success: false,
                message: error.message
            })
        }
    }
}
