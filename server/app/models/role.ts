import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Permission from './permission.js'
import RoleField from './role_field.js'
import Organization from './organization.js'
import { randomUUID } from 'node:crypto'

export default class Role extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @beforeCreate()
    static async generateId(role: Role) {
        role.id = randomUUID()
    }

    @column()
    declare name: string

    @column()
    declare displayName: string

    @column()
    declare description: string | null

    @column({ columnName: 'organization_id' })
    declare organizationId: string | null

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
    @belongsTo(() => Organization)
    declare organization: BelongsTo<typeof Organization>

    @hasMany(() => User)
    declare users: HasMany<typeof User>

    @hasMany(() => RoleField)
    declare roleFields: HasMany<typeof RoleField>

    @manyToMany(() => Permission, {
        pivotTable: 'role_permissions',
        pivotColumns: ['actions'],
        pivotTimestamps: true
    })
    declare permissions: ManyToMany<typeof Permission>

    @manyToMany(() => User, {
        pivotTable: 'user_roles',
        pivotColumns: ['assigned_at', 'assigned_by', 'expires_at', 'is_active'],
        pivotTimestamps: true
    })
    declare assignedUsers: ManyToMany<typeof User>

    // Computed properties
    get userCount() {
        return this.users?.length || 0
    }

    // Helper method to get active role fields
    public async getActiveRoleFields() {
        return await RoleField.query().where('roleId', this.id).where('isActive', true).orderBy('sortOrder', 'asc')
    }

    // Method to check if role belongs to organization
    public belongsToOrganization(organizationId: string): boolean {
        return this.organizationId === organizationId || this.organizationId === null // null means global role
    }

    // Method to get users with this role in the organization
    public async getOrganizationUsers(organizationId?: string) {
        const query = User.query().whereHas('roles', (roleQuery) => {
            roleQuery.where('roles.id', this.id)
        })

        if (organizationId) {
            query.where('organization_id', organizationId)
        } else if (this.organizationId) {
            query.where('organization_id', this.organizationId)
        }

        return await query.preload('organization')
    }

    // Static method to get roles by organization
    static async getByOrganization(organizationId: string, includeGlobal: boolean = true) {
        const query = Role.query().where('is_active', true)

        if (includeGlobal) {
            query.where((builder) => {
                builder.where('organization_id', organizationId)
                    .orWhereNull('organization_id')
            })
        } else {
            query.where('organization_id', organizationId)
        }

        return await query.preload('permissions').orderBy('access_level', 'asc')
    }
}
