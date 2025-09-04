import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeSave } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Admission from './admission.js'
import User from './user.js'
import { v4 as uuid } from 'uuid'

export default class AdmissionCharge extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'admission_id' })
  declare admissionId: string

  @column({ columnName: 'charge_type' })
  declare chargeType: string

  @column()
  declare description: string

  @column()
  declare amount: number

  @column()
  declare quantity: number

  @column({ columnName: 'total_amount' })
  declare totalAmount: number

  @column.date({ columnName: 'charge_date' })
  declare chargeDate: DateTime

  @column({ columnName: 'is_billable' })
  declare isBillable: boolean

  @column({ columnName: 'bill_id' })
  declare billId: string | null

  @column({ columnName: 'created_by' })
  declare createdBy: string

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @belongsTo(() => Admission)
  declare admission: BelongsTo<typeof Admission>

  @belongsTo(() => User, {
    foreignKey: 'createdBy',
  })
  declare creator: BelongsTo<typeof User>

  @beforeSave()
  static async beforeSaveHook(charge: AdmissionCharge) {
    // Generate UUID for primary key if not set
    if (!charge.id) {
      charge.id = uuid()
    }
    
    // Calculate total amount
    charge.totalAmount = charge.amount * charge.quantity
  }
}
