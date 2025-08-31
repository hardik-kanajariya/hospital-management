import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Role from './role.js'
import UserRoleData from './user_role_data.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'passwordHash',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare email: string

  @column({ serializeAs: null, columnName: 'password_hash' })
  declare passwordHash: string

  @column()
  declare name: string

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
  @belongsTo(() => Role)
  declare role: BelongsTo<typeof Role>

  @hasMany(() => UserRoleData)
  declare roleData: HasMany<typeof UserRoleData>

  static accessTokens = DbAccessTokensProvider.forModel(User)

  public async comparePassword(password: string): Promise<boolean> {
    return await hash.verify(this.passwordHash, password)
  }

  // Method to get user permissions through role
  public async getUserPermissions(): Promise<Array<{ module: string; actions: string[] }>> {
    if (!this.role) {
      const user = await User.query()
        .where('id', this.id)
        .preload('role', (roleQuery) => {
          roleQuery.preload('permissions')
        })
        .first()

      if (user?.role) {
        this.role = user.role
      }
    }

    if (!this.role) return []

    return this.role.permissions.map((permission) => {
      // Access pivot data correctly - cast to any to access $pivot
      const pivotData = (permission as any).$pivot
      let actions: string[] = []
      
      if (pivotData?.actions) {
        // If actions is already an array
        if (Array.isArray(pivotData.actions)) {
          actions = pivotData.actions
        } else if (typeof pivotData.actions === 'string') {
          // If actions is a JSON string, parse it
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