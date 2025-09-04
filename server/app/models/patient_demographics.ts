import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Patient from './patient.js'

export default class PatientDemographics extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column()
    declare patientId: string

    @column()
    declare ethnicity: string | null

    @column()
    declare race: string | null

    @column()
    declare primaryLanguage: string | null

    @column()
    declare secondaryLanguage: string | null

    @column()
    declare maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | 'separated' | 'domestic_partnership' | null

    @column()
    declare occupation: string | null

    @column()
    declare employer: string | null

    @column()
    declare educationLevel: 'none' | 'elementary' | 'high_school' | 'some_college' | 'bachelor' | 'master' | 'doctorate' | null

    @column()
    declare religion: string | null

    @column()
    declare preferredContactMethod: 'phone' | 'email' | 'sms' | 'mail'

    @column()
    declare preferredContactTime: string | null

    @column({
        prepare: (value: any) => JSON.stringify(value || {}),
        consume: (value: string | object) => {
            try {
                if (typeof value === 'object' && value !== null) {
                    return value
                }
                return JSON.parse(value as string || '{}')
            } catch {
                return {}
            }
        }
    })
    declare emergencyContact1: Record<string, any>

    @column({
        prepare: (value: any) => JSON.stringify(value || {}),
        consume: (value: string | object) => {
            try {
                if (typeof value === 'object' && value !== null) {
                    return value
                }
                return JSON.parse(value as string || '{}')
            } catch {
                return {}
            }
        }
    })
    declare emergencyContact2: Record<string, any>

    @column({
        prepare: (value: any) => JSON.stringify(value || {}),
        consume: (value: string | object) => {
            try {
                if (typeof value === 'object' && value !== null) {
                    return value
                }
                return JSON.parse(value as string || '{}')
            } catch {
                return {}
            }
        }
    })
    declare nextOfKin: Record<string, any>

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    // Relationships
    @belongsTo(() => Patient)
    declare patient: BelongsTo<typeof Patient>
}
