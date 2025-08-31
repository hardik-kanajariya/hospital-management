import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class AuditLog extends BaseModel {
    public static table = 'audit_logs'

    @column({ isPrimary: true })
    declare id: number

    @column()
    declare userId: number | null

    @column()
    declare action: string

    @column()
    declare description: string

    @column()
    declare type: 'system' | 'user' | 'role' | 'permission' | 'setting' | 'backup' | 'login' | 'logout'

    @column()
    declare entityType: string | null

    @column()
    declare entityId: string | null

    @column()
    declare ipAddress: string | null

    @column()
    declare userAgent: string | null

    @column()
    declare metadata: string | null // JSON string for additional data

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    @belongsTo(() => User)
    declare user: BelongsTo<typeof User>

    // Helper method to get parsed metadata
    public getParsedMetadata(): any {
        if (!this.metadata) return null
        try {
            return JSON.parse(this.metadata)
        } catch {
            return null
        }
    }

    // Helper method to set metadata
    public setMetadata(data: any): void {
        this.metadata = data ? JSON.stringify(data) : null
    }
}
