import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { ManyToMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import Role from './role.js'
import Organization from './organization.js'
import { randomUUID } from 'node:crypto'

export default class Permission extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @beforeCreate()
    static async generateId(permission: Permission) {
        permission.id = randomUUID()
    }

    @column()
    declare name: string

    @column()
    declare displayName: string

    @column()
    declare module: string

    @column()
    declare description: string | null

    @column({ columnName: 'organization_id' })
    declare organizationId: string | null

    @column()
    declare isActive: boolean

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    // Relationships
    @belongsTo(() => Organization)
    declare organization: BelongsTo<typeof Organization>

    @manyToMany(() => Role, {
        pivotTable: 'role_permissions',
        pivotColumns: ['actions'],
        pivotTimestamps: true
    })
    declare roles: ManyToMany<typeof Role>
}
