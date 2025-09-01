import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

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

    /**
     * Get master data by category
     */
    static async getByCategory(category: string, activeOnly: boolean = true) {
        let query = this.query()
            .where('category', category)
            .orderBy('display_order', 'asc')
            .orderBy('name', 'asc')

        if (activeOnly) {
            query = query.where('is_active', true)
        }

        return await query
    }

    /**
     * Get valid values for a category
     */
    static async getValidValues(category: string): Promise<string[]> {
        const items = await this.getByCategory(category, true)
        return items.map(item => item.name)
    }

    /**
     * Check if a value is valid for a category
     */
    static async isValidValue(category: string, value: string): Promise<boolean> {
        const validValues = await this.getValidValues(category)
        console.log('Valid values for category', category, ':', validValues)
        return validValues.includes(value)
    }

    /**
     * Get dropdown options for frontend
     */
    static async getDropdownOptions(category: string) {
        const items = await this.getByCategory(category, true)
        return items.map(item => ({
            label: item.name,
            value: item.name,
            description: item.description,
            metadata: item.metadata
        }))
    }
}
