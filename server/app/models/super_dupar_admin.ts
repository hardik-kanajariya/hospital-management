import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, beforeCreate } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { randomUUID } from 'node:crypto'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
    uids: ['email'],
    passwordColumnName: 'passwordHash',
})

export default class SuperDuparAdmin extends compose(BaseModel, AuthFinder) {
    @column({ isPrimary: true })
    declare id: string

    @beforeCreate()
    static async generateId(superDuparAdmin: SuperDuparAdmin) {
        superDuparAdmin.id = randomUUID()
    }

    @column()
    declare email: string

    @column({ columnName: 'password_hash', serializeAs: null })
    declare passwordHash: string

    @column()
    declare name: string

    @column()
    declare phone: string | null

    @column()
    declare isActive: boolean

    @column.dateTime({ columnName: 'last_login_at' })
    declare lastLoginAt: DateTime | null

    @column({
        prepare: (value: any) => JSON.stringify(value),
        consume: (value: string | object) => {
            if (typeof value === 'string') {
                return JSON.parse(value || '{}')
            }
            return value || {}
        }
    })
    declare settings: Record<string, any>

    @column({
        prepare: (value: any) => JSON.stringify(value),
        consume: (value: string | object) => {
            if (typeof value === 'string') {
                return JSON.parse(value || '[]')
            }
            return value || []
        }
    })
    declare permissions: string[]

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    // Access token provider
    static accessTokens = DbAccessTokensProvider.forModel(SuperDuparAdmin, {
        expiresIn: '7 days',
        prefix: 'sda_',
        table: 'super_dupar_admin_access_tokens',
        type: 'super_dupar_admin_token',
        tokenSecretLength: 40,
    })

    // Method to compare password
    public async comparePassword(password: string): Promise<boolean> {
        return await hash.verify(this.passwordHash, password)
    }

    // Method to log activity
    public async logActivity(action: string, options: {
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
    } = {}) {
        const { default: SuperDuparAdminActivity } = await import('./super_dupar_admin_activity.js')
        return await SuperDuparAdminActivity.create({
            superDuparAdminId: this.id,
            action,
            ...options
        })
    }

    // Check if super dupar admin has access to specific feature
    public hasPermission(permission: string): boolean {
        return this.permissions.includes(permission) || this.permissions.includes('*')
    }

    // Get recent activities
    public async getRecentActivities(limit: number = 10) {
        const { default: SuperDuparAdminActivity } = await import('./super_dupar_admin_activity.js')
        return await SuperDuparAdminActivity.query()
            .where('super_dupar_admin_id', this.id)
            .orderBy('created_at', 'desc')
            .limit(limit)
    }
}
