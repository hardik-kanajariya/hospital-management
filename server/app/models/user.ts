import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, belongsTo, hasMany, manyToMany, beforeCreate } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Role from './role.js'
import UserRoleData from './user_role_data.js'
import Organization from './organization.js'
import UserProfile from './user_profile.js'
import { randomUUID } from 'node:crypto'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'passwordHash',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  static async generateId(user: User) {
    user.id = randomUUID()
  }

  @column()
  declare email: string

  @column({ serializeAs: null, columnName: 'password_hash' })
  declare passwordHash: string

  @column()
  declare name: string

  @column({ columnName: 'organization_id' })
  declare organizationId: string | null

  @column()
  declare roleId: string | null

  // Remove old permissions column - will use role-based permissions
  // @column({
  //   prepare: (value: any) => JSON.stringify(value),
  //   consume: (value: string) => {
  //     try {
  //       return JSON.parse(value)
  //     } catch {
  //       return {}
  //     }
  //   }
  // })
  // declare permissions: Record<string, any>

  @column()
  declare isActive: boolean

  @column({ columnName: 'is_for_demo_purpose' })
  declare isForDemoPurpose: boolean

  @column.dateTime({ columnName: 'last_login' })
  declare lastLogin: DateTime | null

  @column()
  declare phone: string | null

  @column()
  declare department: string | null

  @column({ columnName: 'employee_id' })
  declare employeeId: string | null

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Organization)
  declare organization: BelongsTo<typeof Organization>

  @belongsTo(() => Role)
  declare role: BelongsTo<typeof Role>

  @hasMany(() => UserRoleData)
  declare roleData: HasMany<typeof UserRoleData>

  @hasMany(() => UserProfile)
  declare profiles: HasMany<typeof UserProfile>

  @manyToMany(() => Role, {
    pivotTable: 'user_roles',
    pivotColumns: ['assigned_at', 'assigned_by', 'expires_at', 'is_active'],
    pivotTimestamps: true
  })
  declare roles: ManyToMany<typeof Role>

  static accessTokens = DbAccessTokensProvider.forModel(User)

  public async comparePassword(password: string): Promise<boolean> {
    return await hash.verify(this.passwordHash, password)
  }

  // Method to get user's active roles (from many-to-many relationship)
  public async getActiveRoles(): Promise<Role[]> {
    const userWithRoles = await User.query()
      .where('id', this.id)
      .preload('roles', (query) => {
        query.where('user_roles.is_active', true)
        query.where((subQuery) => {
          subQuery.whereNull('user_roles.expires_at')
          subQuery.orWhere('user_roles.expires_at', '>', new Date())
        })
        query.where('roles.is_active', true) // Also ensure the role itself is active
        query.preload('permissions')
      })
      .first()

    return userWithRoles?.roles || []
  }

  // Method to get user permissions through all active roles
  public async getUserPermissions(): Promise<Array<{ module: string; actions: string[] }>> {
    const activeRoles = await this.getActiveRoles()
    const allPermissions: Array<{ module: string; actions: string[] }> = []

    for (const role of activeRoles) {
      const rolePermissions = role.permissions.map((permission) => {
        const pivotData = (permission as any).$pivot
        let actions: string[] = []

        if (pivotData?.actions) {
          if (Array.isArray(pivotData.actions)) {
            actions = pivotData.actions
          } else if (typeof pivotData.actions === 'string') {
            try {
              actions = JSON.parse(pivotData.actions)
            } catch {
              actions = []
            }
          }
        }

        return {
          module: permission.module,
          actions
        }
      })

      allPermissions.push(...rolePermissions)
    }

    // Merge permissions for same modules
    const mergedPermissions = new Map<string, Set<string>>()

    for (const permission of allPermissions) {
      if (!mergedPermissions.has(permission.module)) {
        mergedPermissions.set(permission.module, new Set())
      }
      permission.actions.forEach(action =>
        mergedPermissions.get(permission.module)!.add(action)
      )
    }

    return Array.from(mergedPermissions.entries()).map(([module, actions]) => ({
      module,
      actions: Array.from(actions)
    }))
  }

  // Method to check if user belongs to organization
  public belongsToOrganization(organizationId: string): boolean {
    return this.organizationId === organizationId
  }

  // Method to get user profile fields
  public async getProfileFields(): Promise<Record<string, any>> {
    const profiles = await UserProfile.query()
      .where('user_id', this.id)
      .where('is_visible', true)
      .orderBy('sort_order', 'asc')

    const profileData: Record<string, any> = {}

    for (const profile of profiles) {
      profileData[profile.fieldKey] = profile.getFormattedValue()
    }

    return profileData
  }

  // Method to set user profile fields
  public async setProfileField(fieldKey: string, value: any, fieldType: string = 'text'): Promise<void> {
    const profile = await UserProfile.updateOrCreate(
      { userId: this.id, fieldKey },
      {
        fieldKey,
        fieldType: fieldType as any,
        isVisible: true,
        sortOrder: 0
      }
    )

    profile.setFormattedValue(value)
    await profile.save()
  }

  // Static method to get users by organization
  static async getByOrganization(organizationId: string) {
    return await User.query()
      .where('organization_id', organizationId)
      .where('is_active', true)
      .preload('roles')
      .preload('organization')
  }

  // Method to check if user has specific permission
  public async hasPermission(module: string, action: string = 'read'): Promise<boolean> {
    const permissions = await this.getUserPermissions()

    // Check for super admin access (wildcard permission)
    const hasWildcard = permissions.some(p => p.module === '*')
    if (hasWildcard) return true

    // Check for specific module permission
    const modulePermission = permissions.find(p => p.module === module)
    return modulePermission ? modulePermission.actions.includes(action) : false
  }

  // Method to get user's role-specific data
  public async getRoleData(): Promise<Record<string, any>> {
    const userWithRoleData = await User.query()
      .where('id', this.id)
      .preload('roleData', (query) => {
        query.preload('roleField')
      })
      .first()

    if (!userWithRoleData) return {}

    const data: Record<string, any> = {}

    for (const roleDataItem of userWithRoleData.roleData) {
      if (roleDataItem.roleField) {
        data[roleDataItem.roleField.fieldName] = roleDataItem.getTypedValue()
      }
    }

    return data
  }

  // Method to set role-specific data
  public async setRoleData(data: Record<string, any>): Promise<void> {
    if (!this.roleId) {
      throw new Error('User must have a role assigned before setting role data')
    }

    const role = await Role.find(this.roleId)
    if (!role) {
      throw new Error('Invalid role')
    }

    const roleFields = await role.getActiveRoleFields()
    const validationErrors: string[] = []

    // Validate all fields
    for (const field of roleFields) {
      const value = data[field.fieldName]
      const validation = field.validateValue(value)

      if (!validation.isValid) {
        validationErrors.push(...validation.errors)
      }
    }

    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`)
    }

    // Save data
    for (const field of roleFields) {
      const value = data[field.fieldName]

      if (value !== undefined) {
        const castedValue = field.castValue(value)
        const stringValue = castedValue === null ? null : String(castedValue)

        await UserRoleData.updateOrCreate(
          { userId: this.id, roleFieldId: field.id },
          { fieldValue: stringValue }
        )
      }
    }
  }

  // Method to get user profile with role data
  public async getCompleteProfile() {
    const roleData = await this.getRoleData()

    return {
      id: this.id,
      email: this.email,
      name: this.name,
      phone: this.phone,
      department: this.department,
      employeeId: this.employeeId,
      isActive: this.isActive,
      lastLogin: this.lastLogin,
      roleId: this.roleId,
      role: this.role,
      roleData,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}