import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Permission from './permission.js'

export default class Role extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column()
    declare name: string

    @column()
    declare displayName: string

    @column()
    declare description: string | null

    @column()
    declare accessLevel: number

    @column()
    declare isActive: boolean

    @column()
    declare isSystemRole: boolean

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    // Relationships
    @hasMany(() => User)
    declare users: HasMany<typeof User>

    @manyToMany(() => Permission, {
        pivotTable: 'role_permissions',
        pivotColumns: ['actions'],
        pivotTimestamps: true
    })
    declare permissions: ManyToMany<typeof Permission>

    // Computed properties
    get userCount() {
        return this.users?.length || 0
    }
}
