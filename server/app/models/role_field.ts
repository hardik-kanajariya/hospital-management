import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Role from './role.js'
import Organization from './organization.js'
import UserRoleData from './user_role_data.js'

export default class RoleField extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column({ columnName: 'role_id' })
    declare roleId: string

    @column({ columnName: 'field_name' })
    declare fieldName: string

    @column({ columnName: 'field_label' })
    declare fieldLabel: string

    @column({ columnName: 'field_type' })
    declare fieldType: 'text' | 'email' | 'number' | 'decimal' | 'boolean' | 'date' | 'datetime' | 'select' | 'multi_select' | 'textarea' | 'file' | 'phone' | 'url'

    @column({
        columnName: 'field_options',
        prepare: (value: any) => JSON.stringify(value || {}),
        consume: (value: string) => {
            try {
                return JSON.parse(value || '{}')
            } catch {
                return {}
            }
        }
    })
    declare fieldOptions: Record<string, any>

    @column({ columnName: 'is_required' })
    declare isRequired: boolean

    @column({ columnName: 'sort_order' })
    declare sortOrder: number

    @column({ columnName: 'is_active' })
    declare isActive: boolean

    @column({ columnName: 'is_system_field' })
    declare isSystemField: boolean

    @column({ columnName: 'organization_id' })
    declare organizationId: string | null

    @column()
    declare description: string | null

    @column({
        columnName: 'validation_rules',
        prepare: (value: any) => JSON.stringify(value || {}),
        consume: (value: string) => {
            try {
                return JSON.parse(value || '{}')
            } catch {
                return {}
            }
        }
    })
    declare validationRules: Record<string, any>

    @column.dateTime({ autoCreate: true, columnName: 'created_at' })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
    declare updatedAt: DateTime

    // Relationships
    @belongsTo(() => Role)
    declare role: BelongsTo<typeof Role>

    @belongsTo(() => Organization)
    declare organization: BelongsTo<typeof Organization>

    @hasMany(() => UserRoleData)
    declare userRoleData: HasMany<typeof UserRoleData>

    // Helper methods
    public validateValue(value: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = []

        // Check required validation
        if (this.isRequired && (value === null || value === undefined || value === '')) {
            errors.push(`${this.fieldLabel} is required`)
        }

        // Type-specific validation
        if (value !== null && value !== undefined && value !== '') {
            switch (this.fieldType) {
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    if (!emailRegex.test(value)) {
                        errors.push(`${this.fieldLabel} must be a valid email`)
                    }
                    break

                case 'number':
                    if (isNaN(Number(value))) {
                        errors.push(`${this.fieldLabel} must be a valid number`)
                    }
                    break

                case 'decimal':
                    if (isNaN(parseFloat(value))) {
                        errors.push(`${this.fieldLabel} must be a valid decimal number`)
                    }
                    break

                case 'boolean':
                    if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
                        errors.push(`${this.fieldLabel} must be true or false`)
                    }
                    break

                case 'date':
                case 'datetime':
                    if (isNaN(Date.parse(value))) {
                        errors.push(`${this.fieldLabel} must be a valid date`)
                    }
                    break

                case 'phone':
                    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
                    if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                        errors.push(`${this.fieldLabel} must be a valid phone number`)
                    }
                    break

                case 'url':
                    try {
                        new URL(value)
                    } catch {
                        errors.push(`${this.fieldLabel} must be a valid URL`)
                    }
                    break

                case 'select':
                    const options = this.fieldOptions.options || []
                    if (!options.some((opt: any) => opt.value === value)) {
                        errors.push(`${this.fieldLabel} must be one of the predefined options`)
                    }
                    break

                case 'multi_select':
                    const multiOptions = this.fieldOptions.options || []
                    const selectedValues = Array.isArray(value) ? value : [value]
                    const invalidValues = selectedValues.filter(v => !multiOptions.some((opt: any) => opt.value === v))
                    if (invalidValues.length > 0) {
                        errors.push(`${this.fieldLabel} contains invalid options: ${invalidValues.join(', ')}`)
                    }
                    break
            }

            // Custom validation rules
            if (this.validationRules.min !== undefined) {
                const numValue = Number(value)
                if (!isNaN(numValue) && numValue < this.validationRules.min) {
                    errors.push(`${this.fieldLabel} must be at least ${this.validationRules.min}`)
                }
            }

            if (this.validationRules.max !== undefined) {
                const numValue = Number(value)
                if (!isNaN(numValue) && numValue > this.validationRules.max) {
                    errors.push(`${this.fieldLabel} must be at most ${this.validationRules.max}`)
                }
            }

            if (this.validationRules.minLength !== undefined) {
                const strValue = String(value)
                if (strValue.length < this.validationRules.minLength) {
                    errors.push(`${this.fieldLabel} must be at least ${this.validationRules.minLength} characters`)
                }
            }

            if (this.validationRules.maxLength !== undefined) {
                const strValue = String(value)
                if (strValue.length > this.validationRules.maxLength) {
                    errors.push(`${this.fieldLabel} must be at most ${this.validationRules.maxLength} characters`)
                }
            }

            if (this.validationRules.pattern) {
                const regex = new RegExp(this.validationRules.pattern)
                if (!regex.test(String(value))) {
                    errors.push(`${this.fieldLabel} format is invalid`)
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    public castValue(value: any): any {
        if (value === null || value === undefined || value === '') {
            return null
        }

        switch (this.fieldType) {
            case 'number':
                return Number(value)
            case 'decimal':
                return parseFloat(value)
            case 'boolean':
                return value === true || value === 'true'
            case 'date':
            case 'datetime':
                return new Date(value)
            case 'multi_select':
                return Array.isArray(value) ? value : [value]
            default:
                return String(value)
        }
    }
}
