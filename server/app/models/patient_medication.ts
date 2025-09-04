import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Patient from './patient.js'

export default class PatientMedication extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column()
    declare patientId: string

    @column()
    declare medicationName: string

    @column()
    declare genericName: string | null

    @column()
    declare dosage: string

    @column()
    declare frequency: string

    @column()
    declare route: string | null

    @column.date()
    declare startDate: DateTime

    @column.date()
    declare endDate: DateTime | null

    @column()
    declare prescribedBy: string | null

    @column()
    declare pharmacyName: string | null

    @column()
    declare reason: string | null

    @column()
    declare status: 'active' | 'discontinued' | 'completed'

    @column()
    declare adherenceNotes: string | null

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    // Relationships
    @belongsTo(() => Patient)
    declare patient: BelongsTo<typeof Patient>
}
