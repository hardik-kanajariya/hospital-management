import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Patient from './patient.js'
import Doctor from './doctor.js'
import Appointment from './appointment.js'

export default class MedicalRecord extends BaseModel {
    public static table = 'medical_records'

    @column({ isPrimary: true })
    declare id: string

    @column({ columnName: 'record_id' })
    declare recordId: string

    @column({ columnName: 'patient_id' })
    declare patientId: string

    @column({ columnName: 'doctor_id' })
    declare doctorId: string

    @column({ columnName: 'appointment_id' })
    declare appointmentId: string | null

    @column({ columnName: 'visit_date' })
    declare visitDate: DateTime

    @column()
    declare diagnosis: string

    @column()
    declare treatment: string

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

    @column({
        columnName: 'lab_results',
        prepare: (value: any) => JSON.stringify(value || []),
        consume: (value: string) => {
            try {
                return JSON.parse(value)
            } catch {
                return []
            }
        }
    })
    declare labResults: Record<string, any>[]

    @column({
        columnName: 'vital_signs',
        prepare: (value: any) => JSON.stringify(value || {}),
        consume: (value: string) => {
            try {
                return JSON.parse(value)
            } catch {
                return {}
            }
        }
    })
    declare vitalSigns: Record<string, any>

    @column()
    declare notes: string | null

    @column({
        columnName: 'follow_up_instructions',
        prepare: (value: any) => JSON.stringify(value || []),
        consume: (value: string) => {
            try {
                return JSON.parse(value)
            } catch {
                return []
            }
        }
    })
    declare followUpInstructions: string[]

    @column({ columnName: 'next_visit_date' })
    declare nextVisitDate: DateTime | null

    @column({
        columnName: 'attachments',
        prepare: (value: any) => JSON.stringify(value || []),
        consume: (value: string) => {
            try {
                return JSON.parse(value)
            } catch {
                return []
            }
        }
    })
    declare attachments: string[]

    @column.dateTime({ autoCreate: true, columnName: 'created_at' })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
    declare updatedAt: DateTime

    // Relationships
    @belongsTo(() => Patient)
    declare patient: BelongsTo<typeof Patient>

    @belongsTo(() => Doctor)
    declare doctor: BelongsTo<typeof Doctor>

    @belongsTo(() => Appointment)
    declare appointment: BelongsTo<typeof Appointment>
}
