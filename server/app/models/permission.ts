import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany, beforeCreate } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Role from './role.js'
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

    @column()
    declare isActive: boolean

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    // Relationships
    @manyToMany(() => Role, {
        pivotTable: 'role_permissions',
        pivotColumns: ['actions'],
        pivotTimestamps: true
    })
    declare roles: ManyToMany<typeof Role>
}
