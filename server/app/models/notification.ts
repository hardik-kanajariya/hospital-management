import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Notification extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column({ columnName: 'user_id' })
    declare userId: string

    @column()
    declare title: string

    @column()
    declare message: string

    @column()
    declare type: 'appointment' | 'emergency' | 'system' | 'reminder' | 'alert' | 'info'

    @column()
    declare priority: 'low' | 'medium' | 'high' | 'critical'

    @column({ columnName: 'is_read' })
    declare isRead: boolean

    @column({
        columnName: 'data',
        prepare: (value: any) => JSON.stringify(value || {}),
        consume: (value: string) => {
            try {
                return JSON.parse(value)
            } catch {
                return {}
            }
        }
    })
    declare data: Record<string, any>

    @column({ columnName: 'action_url' })
    declare actionUrl: string | null

    @column.dateTime({ columnName: 'read_at' })
    declare readAt: DateTime | null

    @column.dateTime({ columnName: 'expires_at' })
    declare expiresAt: DateTime | null

    @column.dateTime({ autoCreate: true, columnName: 'created_at' })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
    declare updatedAt: DateTime

    // Relationships
    @belongsTo(() => User)
    declare user: BelongsTo<typeof User>
}
