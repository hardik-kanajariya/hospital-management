import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import SuperDuparAdmin from './super_dupar_admin.js'
import { randomUUID } from 'node:crypto'

export default class SuperDuparAdminActivity extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @beforeCreate()
    static async generateId(activity: SuperDuparAdminActivity) {
        activity.id = randomUUID()
    }

    @column({ columnName: 'super_dupar_admin_id' })
    declare superDuparAdminId: string

    @column()
    declare action: string

    @column({ columnName: 'entity_type' })
    declare entityType: string | null

    @column({ columnName: 'entity_id' })
    declare entityId: string | null

    @column({
        prepare: (value: any) => JSON.stringify(value),
        consume: (value: string) => JSON.parse(value || '{}')
    })
    declare details: Record<string, any>

    @column({
        columnName: 'before_state',
        prepare: (value: any) => JSON.stringify(value),
        consume: (value: string) => JSON.parse(value || '{}')
    })
    declare beforeState: Record<string, any>

    @column({
        columnName: 'after_state',
        prepare: (value: any) => JSON.stringify(value),
        consume: (value: string) => JSON.parse(value || '{}')
    })
    declare afterState: Record<string, any>

    @column({ columnName: 'ip_address' })
    declare ipAddress: string | null

    @column({ columnName: 'user_agent' })
    declare userAgent: string | null

    @column({ columnName: 'session_id' })
    declare sessionId: string | null

    @column()
    declare status: 'success' | 'failed' | 'pending'

    @column({ columnName: 'error_message' })
    declare errorMessage: string | null

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    // Relationships
    @belongsTo(() => SuperDuparAdmin, {
        foreignKey: 'superDuparAdminId'
    })
    declare superDuparAdmin: BelongsTo<typeof SuperDuparAdmin>

    // Static method to log activity
    static async logActivity(
        superDuparAdminId: string,
        action: string,
        options: {
            entityType?: string
            entityId?: string
            details?: Record<string, any>
            beforeState?: Record<string, any>
            afterState?: Record<string, any>
            ipAddress?: string
            userAgent?: string
            sessionId?: string
            status?: 'success' | 'failed' | 'pending'
            errorMessage?: string
        } = {}
    ) {
        return await this.create({
            superDuparAdminId,
            action,
            entityType: options.entityType || null,
            entityId: options.entityId || null,
            details: options.details || {},
            beforeState: options.beforeState || {},
            afterState: options.afterState || {},
            ipAddress: options.ipAddress || null,
            userAgent: options.userAgent || null,
            sessionId: options.sessionId || null,
            status: options.status || 'success',
            errorMessage: options.errorMessage || null
        })
    }
}
