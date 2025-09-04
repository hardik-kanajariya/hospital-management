import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Patient from './patient.js'

export default class PatientPortalAccess extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column()
    declare patientId: string

    @column()
    declare username: string

    @column()
    declare email: string

    @column()
    declare passwordHash: string

    @column()
    declare isActive: boolean

    @column.dateTime()
    declare lastLogin: DateTime | null

    @column()
    declare loginAttempts: number

    @column.dateTime()
    declare lockedUntil: DateTime | null

    @column()
    declare twoFactorEnabled: boolean

    @column()
    declare twoFactorSecret: string | null

    @column()
    declare passwordResetToken: string | null

    @column.dateTime()
    declare passwordResetExpires: DateTime | null

    @column()
    declare emailVerified: boolean

    @column()
    declare emailVerificationToken: string | null

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
    declare preferences: Record<string, any>

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    // Relationships
    @belongsTo(() => Patient)
    declare patient: BelongsTo<typeof Patient>
}
