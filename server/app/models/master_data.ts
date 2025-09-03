import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Organization from './organization.js'

export default class MasterData extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare category: string

    @column()
    declare name: string

    @column()
    declare description: string | null

    @column()
    declare value: string | null

    @column({ columnName: 'display_order' })
    declare displayOrder: number

    @column({ columnName: 'is_system' })
    declare isSystem: boolean

    @column({ columnName: 'is_active' })
    declare isActive: boolean

    @column({ columnName: 'organization_id' })
    declare organizationId: string | null

    @column({
        prepare: (value: any) => JSON.stringify(value || {}),
        consume: (value: string) => {
            try {
                return JSON.parse(value || '{}')
            } catch {
                return {}
            }
        }
    })
    declare metadata: Record<string, any>

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    // Relationships
    @belongsTo(() => Organization)
    declare organization: BelongsTo<typeof Organization>

    /**
     * Get master data by category for an organization
     */
    static async getByCategory(category: string, organizationId?: string | null, activeOnly: boolean = true) {
        let query = this.query()
            .where('category', category)
            .orderBy('display_order', 'asc')
            .orderBy('name', 'asc')

        // Filter by organization - include system-wide (null) and organization-specific data
        if (organizationId) {
            query = query.where((builder) => {
                builder.whereNull('organization_id').orWhere('organization_id', organizationId)
            })
        } else {
            query = query.whereNull('organization_id')
        }

        if (activeOnly) {
            query = query.where('is_active', true)
        }

        return await query
    }

    /**
     * Get valid values for a category within an organization
     */
    static async getValidValues(category: string, organizationId?: string | null): Promise<string[]> {
        const items = await this.getByCategory(category, organizationId, true)
        return items.map(item => item.name)
    }

    /**
     * Check if a value is valid for a category within an organization
     */
    static async isValidValue(category: string, value: string, organizationId?: string | null): Promise<boolean> {
        const validValues = await this.getValidValues(category, organizationId)
        console.log('Valid values for category', category, ':', validValues)
        return validValues.includes(value)
    }

    /**
     * Get dropdown options for frontend within an organization
     */
    static async getDropdownOptions(category: string, organizationId?: string | null) {
        const items = await this.getByCategory(category, organizationId, true)
        return items.map(item => ({
            label: item.name,
            value: item.name,
            description: item.description,
            metadata: item.metadata
        }))
    }
}
