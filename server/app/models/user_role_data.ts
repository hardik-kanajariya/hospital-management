import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import RoleField from './role_field.js'

export default class UserRoleData extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column({ columnName: 'user_id' })
    declare userId: string

    @column({ columnName: 'role_field_id' })
    declare roleFieldId: string

    @column({ columnName: 'field_value' })
    declare fieldValue: string | null

    @column.dateTime({ autoCreate: true, columnName: 'created_at' })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
    declare updatedAt: DateTime

    // Relationships
    @belongsTo(() => User)
    declare user: BelongsTo<typeof User>

    @belongsTo(() => RoleField)
    declare roleField: BelongsTo<typeof RoleField>

    // Helper method to get typed value based on field type
    public getTypedValue(): any {
        if (!this.roleField) {
            return this.fieldValue
        }

        return this.roleField.castValue(this.fieldValue)
    }
}
