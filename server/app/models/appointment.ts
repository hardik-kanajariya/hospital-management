import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Patient from './patient.js'
import User from './user.js'

export default class Appointment extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column({ columnName: 'appointment_id' })
    declare appointmentId: string

    @column({ columnName: 'patient_id' })
    declare patientId: string

    @column({ columnName: 'doctor_id' })
    declare doctorId: string

    @column.dateTime({ columnName: 'appointment_date' })
    declare appointmentDate: DateTime

    @column.dateTime({ columnName: 'appointment_time' })
    declare appointmentTime: DateTime

    @column()
    declare duration: number

    @column()
    declare status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'

    @column()
    declare type: 'consultation' | 'follow_up' | 'emergency' | 'surgery' | 'checkup'

    @column()
    declare priority: 'normal' | 'urgent' | 'emergency'

    @column()
    declare reason: string

    @column()
    declare notes: string | null

    @column({
        columnName: 'symptoms',
        prepare: (value: any) => JSON.stringify(value || []),
        consume: (value: string) => {
            try {
                return JSON.parse(value)
            } catch {
                return []
            }
        }
    })
    declare symptoms: string[]

    @column({
        columnName: 'vitals',
        prepare: (value: any) => JSON.stringify(value || {}),
        consume: (value: string) => {
            try {
                return JSON.parse(value)
            } catch {
                return {}
            }
        }
    })
    declare vitals: Record<string, any>

    @column.dateTime({ columnName: 'checked_in_at' })
    declare checkedInAt: DateTime | null

    @column.dateTime({ columnName: 'checked_out_at' })
    declare checkedOutAt: DateTime | null

    @column({ columnName: 'room_number' })
    declare roomNumber: string | null

    @column.dateTime({ autoCreate: true, columnName: 'created_at' })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
    declare updatedAt: DateTime

    // Relationships
    @belongsTo(() => Patient, {
        foreignKey: 'patientId'
    })
    declare patient: BelongsTo<typeof Patient>

    @belongsTo(() => User, {
        foreignKey: 'doctorId'
    })
    declare doctor: BelongsTo<typeof User>
}
