import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Organization from './organization.js'
import { randomUUID } from 'node:crypto'

export default class UserAuditLog extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @beforeCreate()
    static async generateId(log: UserAuditLog) {
        log.id = randomUUID()
    }

    @column({ columnName: 'user_id' })
    declare userId: string | null

    @column({ columnName: 'organization_id' })
    declare organizationId: string | null

    @column()
    declare action: string

    @column({ columnName: 'entity_type' })
    declare entityType: string | null

    @column({ columnName: 'entity_id' })
    declare entityId: string | null

    @column({
        prepare: (value: any) => JSON.stringify(value),
        consume: (value: string) => {
            try {
                return JSON.parse(value)
            } catch {
                return {}
            }
        }
    })
    declare details: Record<string, any>

    @column({
        columnName: 'before_state',
        prepare: (value: any) => JSON.stringify(value),
        consume: (value: string) => {
            try {
                return JSON.parse(value)
            } catch {
                return null
            }
        }
    })
    declare beforeState: Record<string, any> | null

    @column({
        columnName: 'after_state',
        prepare: (value: any) => JSON.stringify(value),
        consume: (value: string) => {
            try {
                return JSON.parse(value)
            } catch {
                return null
            }
        }
    })
    declare afterState: Record<string, any> | null

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
    @belongsTo(() => User)
    declare user: BelongsTo<typeof User>

    @belongsTo(() => Organization)
    declare organization: BelongsTo<typeof Organization>

    // Static methods for creating audit logs
    static async logUserAction(
        userId: string | null,
        organizationId: string | null,
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
        return await UserAuditLog.create({
            userId,
            organizationId,
            action,
            entityType: options.entityType,
            entityId: options.entityId,
            details: options.details || {},
            beforeState: options.beforeState,
            afterState: options.afterState,
            ipAddress: options.ipAddress,
            userAgent: options.userAgent,
            sessionId: options.sessionId,
            status: options.status || 'success',
            errorMessage: options.errorMessage
        })
    }

    static async logLogin(userId: string, organizationId: string, ipAddress?: string, userAgent?: string) {
        return await this.logUserAction(userId, organizationId, 'login', {
            details: { timestamp: DateTime.now().toISO() },
            ipAddress,
            userAgent
        })
    }

    static async logLogout(userId: string, organizationId: string, ipAddress?: string) {
        return await this.logUserAction(userId, organizationId, 'logout', {
            details: { timestamp: DateTime.now().toISO() },
            ipAddress
        })
    }

    static async logRoleChange(
        userId: string,
        organizationId: string,
        targetUserId: string,
        oldRoles: any[],
        newRoles: any[],
        ipAddress?: string
    ) {
        return await this.logUserAction(userId, organizationId, 'role_change', {
            entityType: 'user',
            entityId: targetUserId,
            beforeState: { roles: oldRoles },
            afterState: { roles: newRoles },
            ipAddress
        })
    }
}
