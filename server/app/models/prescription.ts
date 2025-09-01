import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Patient from './patient.js'
import User from './user.js'
import Appointment from './appointment.js'

export default class Prescription extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column({ columnName: 'prescription_id' })
    declare prescriptionId: string

    @column({ columnName: 'patient_id' })
    declare patientId: string

    @column({ columnName: 'doctor_id' })
    declare doctorId: string

    @column({ columnName: 'appointment_id' })
    declare appointmentId: string | null

    @column.date({ columnName: 'prescription_date' })
    declare prescriptionDate: DateTime

    @column({
        columnName: 'medications',
        prepare: (value: any) => JSON.stringify(value || []),
        consume: (value: string) => {
            try {
                return JSON.parse(value)
            } catch {
                return []
            }
        }
    })
    declare medications: Record<string, any>[]

    @column()
    declare diagnosis: string

    @column()
    declare instructions: string | null

    @column()
    declare notes: string | null

    @column()
    declare status: string

    @column.date({ columnName: 'valid_until' })
    declare validUntil: DateTime | null

    @column({ columnName: 'dispensed_by' })
    declare dispensedBy: string | null

    @column.dateTime({ columnName: 'dispensed_at' })
    declare dispensedAt: DateTime | null

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

    @belongsTo(() => Appointment, {
        foreignKey: 'appointmentId'
    })
    declare appointment: BelongsTo<typeof Appointment>
}
