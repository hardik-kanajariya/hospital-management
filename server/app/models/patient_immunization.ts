import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Patient from './patient.js'

export default class PatientImmunization extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column()
    declare patientId: string

    @column()
    declare vaccineName: string

    @column()
    declare vaccineCode: string | null

    @column()
    declare doseNumber: number

    @column.date()
    declare administrationDate: DateTime

    @column()
    declare administrationSite: string | null

    @column()
    declare lotNumber: string | null

    @column()
    declare manufacturer: string | null

    @column.date()
    declare expiryDate: DateTime | null

    @column()
    declare administeredBy: string | null

    @column.date()
    declare nextDueDate: DateTime | null

    @column()
    declare reactionNotes: string | null

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    // Relationships
    @belongsTo(() => Patient)
    declare patient: BelongsTo<typeof Patient>
}
