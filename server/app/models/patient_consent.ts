import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Patient from './patient.js'

export default class PatientConsent extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column()
    declare patientId: string

    @column()
    declare consentType: 'treatment' | 'data-sharing' | 'research' | 'photography' | 'marketing'

    @column()
    declare consentFormId: string | null

    @column()
    declare status: 'granted' | 'revoked' | 'expired'

    @column.dateTime()
    declare grantedDate: DateTime

    @column.date()
    declare expiryDate: DateTime | null

    @column.dateTime()
    declare revokedDate: DateTime | null

    @column()
    declare witnessName: string | null

    @column()
    declare witnessSignature: string | null

    @column()
    declare patientSignature: string | null

    @column()
    declare guardianSignature: string | null

    @column()
    declare documentPath: string | null

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    // Relationships
    @belongsTo(() => Patient)
    declare patient: BelongsTo<typeof Patient>
}
