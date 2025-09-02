import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import { randomUUID } from 'node:crypto'

export default class UserProfile extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @beforeCreate()
    static async generateId(profile: UserProfile) {
        profile.id = randomUUID()
    }

    @column({ columnName: 'user_id' })
    declare userId: string

    @column({ columnName: 'field_key' })
    declare fieldKey: string

    @column({ columnName: 'field_value' })
    declare fieldValue: string | null

    @column({ columnName: 'field_type' })
    declare fieldType: 'text' | 'number' | 'date' | 'datetime' | 'boolean' | 'select' | 'multiselect' | 'file' | 'email' | 'phone' | 'url'

    @column({
        columnName: 'field_options',
        prepare: (value: any) => JSON.stringify(value),
        consume: (value: string) => {
            try {
                return JSON.parse(value)
            } catch {
                return {}
            }
        }
    })
    declare fieldOptions: Record<string, any>

    @column({ columnName: 'is_required' })
    declare isRequired: boolean

    @column({ columnName: 'is_visible' })
    declare isVisible: boolean

    @column({ columnName: 'sort_order' })
    declare sortOrder: number

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    // Relationships
    @belongsTo(() => User)
    declare user: BelongsTo<typeof User>

    // Methods
    public getFormattedValue(): any {
        if (!this.fieldValue) return null

        switch (this.fieldType) {
            case 'number':
                return parseFloat(this.fieldValue)
            case 'boolean':
                return this.fieldValue === 'true' || this.fieldValue === '1'
            case 'date':
            case 'datetime':
                return DateTime.fromISO(this.fieldValue)
            case 'multiselect':
                try {
                    return JSON.parse(this.fieldValue)
                } catch {
                    return []
                }
            default:
                return this.fieldValue
        }
    }

    public setFormattedValue(value: any): void {
        if (value === null || value === undefined) {
            this.fieldValue = null
            return
        }

        switch (this.fieldType) {
            case 'multiselect':
                this.fieldValue = JSON.stringify(value)
                break
            case 'date':
            case 'datetime':
                if (value instanceof DateTime) {
                    this.fieldValue = value.toISO()
                } else if (typeof value === 'string') {
                    this.fieldValue = value
                } else {
                    this.fieldValue = DateTime.fromJSDate(value).toISO()
                }
                break
            default:
                this.fieldValue = String(value)
        }
    }
}
