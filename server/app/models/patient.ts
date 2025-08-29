import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Appointment from './appointment.js'
import Bill from './bill.js'
import MedicalRecord from './medical_record.js'

export default class Patient extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column({ columnName: 'patient_id' })
    declare patientId: string

    @column()
    declare name: string

    @column()
    declare phone: string

    @column()
    declare email: string | null

    @column.date({ columnName: 'date_of_birth' })
    declare dateOfBirth: DateTime

    @column()
    declare gender: 'male' | 'female' | 'other'

    @column()
    declare address: string

    @column({
        columnName: 'emergency_contact',
        prepare: (value: any) => JSON.stringify(value),
        consume: (value: string) => {
            try {
                return JSON.parse(value)
            } catch {
                return {}
            }
        }
    })
    declare emergencyContact: Record<string, any>

    @column({ columnName: 'blood_group' })
    declare bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null

    @column({
        prepare: (value: any) => JSON.stringify(value || []),
        consume: (value: string) => {
            try {
                return JSON.parse(value)
            } catch {
                return []
            }
        }
    })
    declare allergies: string[]

    @column({
        columnName: 'chronic_conditions',
        prepare: (value: any) => JSON.stringify(value || []),
        consume: (value: string) => {
            try {
                return JSON.parse(value)
            } catch {
                return []
            }
        }
    })
    declare chronicConditions: string[]

    @column({
        columnName: 'vaccination_records',
        prepare: (value: any) => JSON.stringify(value || []),
        consume: (value: string) => {
            try {
                return JSON.parse(value)
            } catch {
                return []
            }
        }
    })
    declare vaccinationRecords: Record<string, any>[]

    @column({
        columnName: 'insurance_info',
        prepare: (value: any) => JSON.stringify(value || {}),
        consume: (value: string) => {
            try {
                return JSON.parse(value)
            } catch {
                return {}
            }
        }
    })
    declare insuranceInfo: Record<string, any>

    @column.dateTime({ autoCreate: true, columnName: 'created_at' })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
    declare updatedAt: DateTime

    // Relationships
    @hasMany(() => Appointment)
    declare appointments: HasMany<typeof Appointment>

    @hasMany(() => MedicalRecord)
    declare medicalRecords: HasMany<typeof MedicalRecord>

    @hasMany(() => Bill)
    declare bills: HasMany<typeof Bill>
}
