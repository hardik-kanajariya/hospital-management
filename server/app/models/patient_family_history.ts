import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Patient from './patient.js'

export default class PatientFamilyHistory extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column()
    declare patientId: string

    @column()
    declare relationship: 'father' | 'mother' | 'sibling' | 'grandparent' | 'aunt' | 'uncle' | 'cousin' | 'other'

    @column()
    declare condition: string

    @column()
    declare ageAtDiagnosis: number | null

    @column()
    declare currentStatus: 'living' | 'deceased' | 'unknown' | null

    @column()
    declare notes: string | null

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    // Relationships
    @belongsTo(() => Patient)
    declare patient: BelongsTo<typeof Patient>
}
