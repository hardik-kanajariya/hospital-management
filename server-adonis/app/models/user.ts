import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, beforeSave } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

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
  declare role: 'super_admin' | 'doctor' | 'billing_manager' | 'nurse' | 'lab_technician' | 'pharmacist' | 'medical_store_manager' | 'receptionist'

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
  declare permissions: Record<string, any>

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

  @beforeSave()
  public static async setPermissions(user: User) {
    if (user.$dirty.role || !user.permissions || Object.keys(user.permissions).length === 0) {
      user.permissions = User.getPermissionsForRole(user.role)
    }
  }

  static accessTokens = DbAccessTokensProvider.forModel(User)

  public static getPermissionsForRole(role: string): Record<string, any> {
    const rolePermissions: Record<string, any> = {
      'super_admin': [
        { module: '*', actions: ['create', 'read', 'update', 'delete'] }
      ],
      'doctor': [
        { module: 'dashboard', actions: ['read'] },
        { module: 'patients', actions: ['create', 'read', 'update'] },
        { module: 'appointments', actions: ['create', 'read', 'update'] },
        { module: 'medical_records', actions: ['create', 'read', 'update'] },
        { module: 'doctors', actions: ['read', 'update'] },
        { module: 'prescriptions', actions: ['create', 'read', 'update'] },
        { module: 'lab_tests', actions: ['create', 'read'] },
        { module: 'beds', actions: ['read', 'update'] },
        { module: 'billing', actions: ['read'] },
        { module: 'notifications', actions: ['create', 'read'] }
      ],
      'billing_manager': [
        { module: 'dashboard', actions: ['read'] },
        { module: 'patients', actions: ['read'] },
        { module: 'appointments', actions: ['read'] },
        { module: 'billing', actions: ['create', 'read', 'update', 'delete'] },
        { module: 'inventory', actions: ['read'] },
        { module: 'notifications', actions: ['create', 'read'] }
      ],
      'nurse': [
        { module: 'dashboard', actions: ['read'] },
        { module: 'patients', actions: ['read', 'update'] },
        { module: 'appointments', actions: ['read', 'update'] },
        { module: 'medical_records', actions: ['read'] },
        { module: 'beds', actions: ['read', 'update'] },
        { module: 'notifications', actions: ['create', 'read'] }
      ],
      'lab_technician': [
        { module: 'dashboard', actions: ['read'] },
        { module: 'patients', actions: ['read'] },
        { module: 'lab_tests', actions: ['create', 'read', 'update'] },
        { module: 'notifications', actions: ['create', 'read'] }
      ],
      'pharmacist': [
        { module: 'dashboard', actions: ['read'] },
        { module: 'patients', actions: ['read'] },
        { module: 'prescriptions', actions: ['read', 'update'] },
        { module: 'inventory', actions: ['read', 'update'] },
        { module: 'notifications', actions: ['create', 'read'] }
      ],
      'medical_store_manager': [
        { module: 'dashboard', actions: ['read'] },
        { module: 'inventory', actions: ['create', 'read', 'update', 'delete'] },
        { module: 'notifications', actions: ['create', 'read'] }
      ],
      'receptionist': [
        { module: 'dashboard', actions: ['read'] },
        { module: 'patients', actions: ['create', 'read', 'update'] },
        { module: 'appointments', actions: ['create', 'read', 'update'] },
        { module: 'billing', actions: ['read'] },
        { module: 'notifications', actions: ['create', 'read'] }
      ]
    }

    return rolePermissions[role] || []
  }

  public async comparePassword(password: string): Promise<boolean> {
    return await hash.verify(this.passwordHash, password)
  }
}