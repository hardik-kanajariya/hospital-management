import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Role from './role.js'
import { randomUUID } from 'node:crypto'

export default class Organization extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @beforeCreate()
    static async generateId(organization: Organization) {
        organization.id = randomUUID()
    }

    @column()
    declare name: string

    @column()
    declare type: string | null

    @column({ columnName: 'registration_number' })
    declare registrationNumber: string | null

    @column()
    declare address: string | null

    @column()
    declare phone: string | null

    @column()
    declare email: string | null

    @column()
    declare website: string | null

    @column()
    declare status: 'active' | 'inactive' | 'suspended'

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
    declare settings: Record<string, any>

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
    declare branding: Record<string, any>

    @column()
    declare timezone: string

    @column()
    declare currency: string

    @column()
    declare language: string

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    // Relationships
    @hasMany(() => User)
    declare users: HasMany<typeof User>

    @hasMany(() => Role)
    declare roles: HasMany<typeof Role>

    // Computed properties
    get activeUsersCount() {
        return this.users?.filter(user => user.isActive)?.length || 0
    }

    get totalRolesCount() {
        return this.roles?.length || 0
    }

    // Methods
    public async getActiveUsers() {
        return await User.query()
            .where('organization_id', this.id)
            .where('is_active', true)
            .preload('role')
    }

    public async getOrganizationRoles() {
        return await Role.query()
            .where('organization_id', this.id)
            .where('is_active', true)
            .preload('permissions')
    }

    public isActive(): boolean {
        return this.status === 'active'
    }
}
