import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Patient from './patient.js'

export default class PatientAllergy extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column()
    declare patientId: string

    @column()
    declare allergyType: 'drug' | 'food' | 'environmental' | 'other'

    @column()
    declare allergen: string

    @column()
    declare severity: 'mild' | 'moderate' | 'severe' | 'life-threatening'

    @column()
    declare reactionType: string | null

    @column.date()
    declare onsetDate: DateTime | null

    @column()
    declare notes: string | null

    @column()
    declare status: 'active' | 'inactive' | 'resolved'

    @column()
    declare reportedBy: string | null

    @column()
    declare verifiedBy: string | null

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    // Relationships
    @belongsTo(() => Patient)
    declare patient: BelongsTo<typeof Patient>
}
