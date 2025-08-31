import { inject } from '@adonisjs/core'
import Role from '#models/role'
import RoleField from '#models/role_field'
import UserRoleData from '#models/user_role_data'
import User from '#models/user'
import { v4 as uuidv4 } from 'uuid'

@inject()
export default class RoleFieldService {

    /**
     * Create a new role field
     */
    async createRoleField(roleId: string, fieldData: {
        fieldName: string
        fieldLabel: string
        fieldType: string
        fieldOptions?: Record<string, any>
        isRequired?: boolean
        sortOrder?: number
        description?: string
        validationRules?: Record<string, any>
    }) {
        // Validate role exists
        const role = await Role.find(roleId)
        if (!role) {
            throw new Error('Role not found')
        }

        // Check for duplicate field names
        const existingField = await RoleField.query()
            .where('roleId', roleId)
            .where('fieldName', fieldData.fieldName)
            .first()

        if (existingField) {
            throw new Error('Field name already exists for this role')
        }

        const roleField = new RoleField()
        roleField.id = uuidv4()
        roleField.roleId = roleId
        roleField.fieldName = fieldData.fieldName
        roleField.fieldLabel = fieldData.fieldLabel
        roleField.fieldType = fieldData.fieldType as any
        roleField.fieldOptions = fieldData.fieldOptions || {}
        roleField.isRequired = fieldData.isRequired || false
        roleField.sortOrder = fieldData.sortOrder || 0
        roleField.description = fieldData.description || null
        roleField.validationRules = fieldData.validationRules || {}
        roleField.isActive = true
        roleField.isSystemField = (fieldData as any).isSystemField || false

        await roleField.save()
        return roleField
    }

    /**
     * Update a role field
     */
    async updateRoleField(fieldId: string, fieldData: Partial<{
        fieldLabel: string
        fieldType: 'text' | 'email' | 'number' | 'decimal' | 'boolean' | 'date' | 'datetime' | 'select' | 'multi_select' | 'textarea' | 'file' | 'phone' | 'url'
        fieldOptions: Record<string, any>
        isRequired: boolean
        sortOrder: number
        description: string
        validationRules: Record<string, any>
        isActive: boolean
    }>) {
        const roleField = await RoleField.find(fieldId)
        if (!roleField) {
            throw new Error('Role field not found')
        }

        if (fieldData.fieldLabel !== undefined) roleField.fieldLabel = fieldData.fieldLabel
        if (fieldData.fieldType !== undefined) roleField.fieldType = fieldData.fieldType
        if (fieldData.fieldOptions !== undefined) roleField.fieldOptions = fieldData.fieldOptions
        if (fieldData.isRequired !== undefined) roleField.isRequired = fieldData.isRequired
        if (fieldData.sortOrder !== undefined) roleField.sortOrder = fieldData.sortOrder
        if (fieldData.description !== undefined) roleField.description = fieldData.description
        if (fieldData.validationRules !== undefined) roleField.validationRules = fieldData.validationRules
        if (fieldData.isActive !== undefined) roleField.isActive = fieldData.isActive

        await roleField.save()
        return roleField
    }

    /**
     * Delete a role field (soft delete by setting isActive to false)
     */
    async deleteRoleField(fieldId: string) {
        const roleField = await RoleField.find(fieldId)
        if (!roleField) {
            throw new Error('Role field not found')
        }

        roleField.isActive = false
        await roleField.save()
        return roleField
    }

    /**
     * Get all fields for a role
     */
    async getRoleFields(roleId: string, activeOnly: boolean = true) {
        const query = RoleField.query().where('roleId', roleId)

        if (activeOnly) {
            query.where('isActive', true)
        }

        return await query.orderBy('sortOrder', 'asc')
    }

    /**
     * Get role field schema for frontend form generation
     */
    async getRoleFieldSchema(roleId: string) {
        const fields = await this.getRoleFields(roleId)

        return fields.map(field => ({
            id: field.id,
            name: field.fieldName,
            label: field.fieldLabel,
            type: field.fieldType,
            required: field.isRequired,
            options: field.fieldOptions,
            validation: field.validationRules,
            description: field.description,
            sortOrder: field.sortOrder
        }))
    }

    /**
     * Set user role data with validation
     */
    async setUserRoleData(userId: string, roleData: Record<string, any>) {
        const user = await User.find(userId)
        if (!user) {
            throw new Error('User not found')
        }

        if (!user.roleId) {
            throw new Error('User must have a role assigned')
        }

        const roleFields = await this.getRoleFields(user.roleId)
        const validationErrors: string[] = []

        // Validate all fields
        for (const field of roleFields) {
            const value = roleData[field.fieldName]
            const validation = field.validateValue(value)

            if (!validation.isValid) {
                validationErrors.push(...validation.errors)
            }
        }

        if (validationErrors.length > 0) {
            throw new Error(`Validation failed: ${validationErrors.join(', ')}`)
        }

        // Save data
        for (const field of roleFields) {
            const value = roleData[field.fieldName]

            if (value !== undefined) {
                const castedValue = field.castValue(value)
                const stringValue = castedValue === null ? null : String(castedValue)

                await UserRoleData.updateOrCreate(
                    { userId: userId, roleFieldId: field.id },
                    {
                        id: uuidv4(),
                        fieldValue: stringValue
                    }
                )
            }
        }

        return await this.getUserRoleData(userId)
    }

    /**
     * Get user role data
     */
    async getUserRoleData(userId: string): Promise<Record<string, any>> {
        const user = await User.find(userId)
        if (!user) {
            throw new Error('User not found')
        }

        return await user.getRoleData()
    }

    /**
     * Get users with their role data
     */
    async getUsersWithRoleData(roleId?: string, page: number = 1, limit: number = 20) {
        const query = User.query().preload('role')

        if (roleId) {
            query.where('roleId', roleId)
        }

        const users = await query.paginate(page, limit)

        const usersWithData = await Promise.all(
            users.all().map(async (user) => ({
                ...user.serialize(),
                roleData: await user.getRoleData()
            }))
        )

        return {
            data: usersWithData,
            meta: users.getMeta()
        }
    }

    /**
     * Bulk create role fields from template
     */
    async createRoleFieldsFromTemplate(roleId: string, template: Array<{
        fieldName: string
        fieldLabel: string
        fieldType: string
        fieldOptions?: Record<string, any>
        isRequired?: boolean
        sortOrder?: number
        description?: string
        validationRules?: Record<string, any>
    }>) {
        const createdFields = []

        for (const fieldData of template) {
            try {
                const field = await this.createRoleField(roleId, fieldData)
                createdFields.push(field)
            } catch (error) {
                console.error(`Failed to create field ${fieldData.fieldName}:`, error.message)
            }
        }

        return createdFields
    }

    /**
     * Create predefined doctor role fields as example
     */
    async createDoctorRoleFields(roleId: string) {
        const doctorFields = [
            {
                fieldName: 'doctorId',
                fieldLabel: 'Doctor ID',
                fieldType: 'text',
                isRequired: true,
                sortOrder: 1,
                description: 'Unique identifier for the doctor',
                validationRules: { pattern: '^DOC[0-9]{4}$' }
            },
            {
                fieldName: 'specialization',
                fieldLabel: 'Specialization',
                fieldType: 'select',
                isRequired: true,
                sortOrder: 2,
                fieldOptions: {
                    options: [
                        { value: 'cardiology', label: 'Cardiology' },
                        { value: 'neurology', label: 'Neurology' },
                        { value: 'orthopedics', label: 'Orthopedics' },
                        { value: 'pediatrics', label: 'Pediatrics' },
                        { value: 'general_medicine', label: 'General Medicine' },
                        { value: 'surgery', label: 'Surgery' },
                        { value: 'dermatology', label: 'Dermatology' },
                        { value: 'psychiatry', label: 'Psychiatry' }
                    ]
                }
            },
            {
                fieldName: 'qualification',
                fieldLabel: 'Medical Qualification',
                fieldType: 'text',
                isRequired: true,
                sortOrder: 3,
                description: 'Medical degree and certifications'
            },
            {
                fieldName: 'experience',
                fieldLabel: 'Years of Experience',
                fieldType: 'number',
                isRequired: true,
                sortOrder: 4,
                validationRules: { min: 0, max: 50 }
            },
            {
                fieldName: 'licenseNumber',
                fieldLabel: 'Medical License Number',
                fieldType: 'text',
                isRequired: true,
                sortOrder: 5,
                description: 'Official medical license number'
            },
            {
                fieldName: 'availableDays',
                fieldLabel: 'Available Days',
                fieldType: 'multi_select',
                isRequired: true,
                sortOrder: 6,
                fieldOptions: {
                    options: [
                        { value: 'monday', label: 'Monday' },
                        { value: 'tuesday', label: 'Tuesday' },
                        { value: 'wednesday', label: 'Wednesday' },
                        { value: 'thursday', label: 'Thursday' },
                        { value: 'friday', label: 'Friday' },
                        { value: 'saturday', label: 'Saturday' },
                        { value: 'sunday', label: 'Sunday' }
                    ]
                }
            },
            {
                fieldName: 'consultationFee',
                fieldLabel: 'Consultation Fee',
                fieldType: 'decimal',
                isRequired: true,
                sortOrder: 7,
                validationRules: { min: 0 },
                description: 'Fee in local currency'
            },
            {
                fieldName: 'isAvailable',
                fieldLabel: 'Currently Available',
                fieldType: 'boolean',
                isRequired: false,
                sortOrder: 8,
                description: 'Whether the doctor is currently accepting patients'
            }
        ]

        return await this.createRoleFieldsFromTemplate(roleId, doctorFields)
    }
}
