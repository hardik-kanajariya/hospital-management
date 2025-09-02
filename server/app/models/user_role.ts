import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Role from './role.js'

export default class UserRole extends BaseModel {
    @column({ columnName: 'user_id', isPrimary: true })
    declare userId: string

    @column({ columnName: 'role_id', isPrimary: true })
    declare roleId: string

    @column.dateTime({ columnName: 'assigned_at' })
    declare assignedAt: DateTime

    @column({ columnName: 'assigned_by' })
    declare assignedBy: string | null

    @column.dateTime({ columnName: 'expires_at' })
    declare expiresAt: DateTime | null

    @column({ columnName: 'is_active' })
    declare isActive: boolean

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    // Relationships
    @belongsTo(() => User, {
        foreignKey: 'userId'
    })
    declare user: BelongsTo<typeof User>

    @belongsTo(() => Role, {
        foreignKey: 'roleId'
    })
    declare role: BelongsTo<typeof Role>

    @belongsTo(() => User, {
        foreignKey: 'assignedBy'
    })
    declare assignedByUser: BelongsTo<typeof User>

    // Methods
    public isExpired(): boolean {
        if (!this.expiresAt) return false
        return this.expiresAt < DateTime.now()
    }

    public isCurrentlyActive(): boolean {
        return this.isActive && !this.isExpired()
    }

    public getDaysUntilExpiry(): number | null {
        if (!this.expiresAt) return null
        const diff = this.expiresAt.diff(DateTime.now(), 'days')
        return Math.ceil(diff.days)
    }
}
