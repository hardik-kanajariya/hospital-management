import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Patient from './patient.js'

export default class PatientCommunicationPreferences extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column()
    declare patientId: string

    @column()
    declare appointmentReminders: boolean

    @column()
    declare appointmentReminderMethod: 'sms' | 'email' | 'call' | 'all'

    @column()
    declare appointmentReminderTiming: number // hours before

    @column()
    declare labResultsNotification: boolean

    @column()
    declare labResultsMethod: 'sms' | 'email' | 'portal'

    @column()
    declare billingNotifications: boolean

    @column()
    declare billingMethod: 'email' | 'paper' | 'both'

    @column()
    declare marketingCommunications: boolean

    @column()
    declare healthTips: boolean

    @column()
    declare surveyParticipation: boolean

    @column()
    declare preferredPharmacyId: string | null

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    // Relationships
    @belongsTo(() => Patient)
    declare patient: BelongsTo<typeof Patient>
}
