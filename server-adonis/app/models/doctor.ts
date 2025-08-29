import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Appointment from './appointment.js'

export default class Doctor extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column({ columnName: 'user_id' })
    declare userId: string

    @column({ columnName: 'doctor_id' })
    declare doctorId: string

    @column()
    declare specialization: string

    @column()
    declare qualification: string

    @column()
    declare experience: number

    @column({ columnName: 'license_number' })
    declare licenseNumber: string

    @column()
    declare department: string

    @column({
        columnName: 'available_days',
        prepare: (value: any) => JSON.stringify(value || []),
        consume: (value: string) => {
            try {
                return JSON.parse(value)
            } catch {
                return []
            }
        }
    })
    declare availableDays: string[]

    @column({
        columnName: 'available_hours',
        prepare: (value: any) => JSON.stringify(value || {}),
        consume: (value: string) => {
            try {
                return JSON.parse(value)
            } catch {
                return {}
            }
        }
    })
    declare availableHours: Record<string, any>

    @column({ columnName: 'consultation_fee' })
    declare consultationFee: number

    @column({ columnName: 'is_available' })
    declare isAvailable: boolean

    @column.dateTime({ autoCreate: true, columnName: 'created_at' })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
    declare updatedAt: DateTime

    // Relationships
    @belongsTo(() => User)
    declare user: BelongsTo<typeof User>

    @hasMany(() => Appointment)
    declare appointments: HasMany<typeof Appointment>
}
