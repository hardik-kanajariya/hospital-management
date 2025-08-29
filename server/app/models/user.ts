import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Role from './role.js'

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

  static accessTokens = DbAccessTokensProvider.forModel(User)

  public async comparePassword(password: string): Promise<boolean> {
    return await hash.verify(this.passwordHash, password)
  }

  // Method to get user permissions through role
  public async getUserPermissions() {
    await this.load('role', (roleQuery) => {
      roleQuery.preload('permissions')
    })

    if (!this.role) return []

    return this.role.permissions.map(permission => ({
      module: permission.module,
      actions: permission.$pivot?.actions || []
    }))
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
}