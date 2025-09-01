import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Appointment from './appointment.js'
import Bill from './bill.js'
import MedicalRecord from './medical_record.js'

export default class Patient extends BaseModel {
    public static readonly deletedAtColumn = 'deleted_at'

    @column({ isPrimary: true })
    declare id: string

    @column({ columnName: 'patient_id', serializeAs: 'patient_id' })
    declare patientId: string

    @column()
    declare name: string

    @column()
    declare phone: string

    @column()
    declare email: string | null

    @column.date({
        columnName: 'date_of_birth',
        serializeAs: 'date_of_birth',
        serialize: (value: DateTime | null) => {
            return value ? value.toFormat('yyyy-MM-dd') : null
        }
    })
    declare dateOfBirth: DateTime

    @column()
    declare gender: string

    @column()
    declare address: string

    @column({
        columnName: 'emergency_contact',
        serializeAs: 'emergency_contact',
        prepare: (value: any) => JSON.stringify(value || {}),
        consume: (value: string | object) => {
            try {
                // If value is already an object (from database), return it
                if (typeof value === 'object' && value !== null) {
                    const parsed = value as any
                    return {
                        name: parsed.name || '',
                        relationship: parsed.relationship || '',
                        phone: parsed.phone || '',
                        email: parsed.email || '',
                        address: parsed.address || ''
                    }
                }
                // If value is a string, parse it
                const parsed = JSON.parse(value as string || '{}')
                return {
                    name: parsed.name || '',
                    relationship: parsed.relationship || '',
                    phone: parsed.phone || '',
                    email: parsed.email || '',
                    address: parsed.address || ''
                }
            } catch {
                return {
                    name: '',
                    relationship: '',
                    phone: '',
                    email: '',
                    address: ''
                }
            }
        }
    })
    declare emergencyContact: Record<string, any>

    @column({ columnName: 'blood_group', serializeAs: 'blood_group' })
    declare bloodGroup: string | null

    @column({
        columnName: 'allergies',
        serializeAs: 'allergies',
        prepare: (value: any) => JSON.stringify(value || []),
        consume: (value: string | any[]) => {
            try {
                // If value is already an array (from database), return it
                if (Array.isArray(value)) {
                    return value
                }
                // If value is a string, parse it
                return JSON.parse(value as string)
            } catch {
                return []
            }
        }
    })
    declare allergies: string[]

    @column({
        columnName: 'chronic_conditions',
        serializeAs: 'chronic_conditions',
        prepare: (value: any) => JSON.stringify(value || []),
        consume: (value: string | any[]) => {
            try {
                // If value is already an array (from database), return it
                if (Array.isArray(value)) {
                    return value
                }
                // If value is a string, parse it
                return JSON.parse(value as string)
            } catch {
                return []
            }
        }
    })
    declare chronicConditions: string[]

    @column({
        columnName: 'vaccination_records',
        serializeAs: 'vaccination_records',
        prepare: (value: any) => JSON.stringify(value || []),
        consume: (value: string | any[]) => {
            try {
                // If value is already an array (from database), return it
                if (Array.isArray(value)) {
                    return value
                }
                // If value is a string, parse it
                return JSON.parse(value as string)
            } catch {
                return []
            }
        }
    })
    declare vaccinationRecords: Record<string, any>[]

    @column({
        columnName: 'insurance_info',
        serializeAs: 'insurance_info',
        prepare: (value: any) => JSON.stringify(value || {}),
        consume: (value: string | object) => {
            try {
                // If value is already an object (from database), return it
                if (typeof value === 'object' && value !== null) {
                    return value
                }
                // If value is a string, parse it
                return JSON.parse(value as string)
            } catch {
                return {}
            }
        }
    })
    declare insuranceInfo: Record<string, any>

    @column.dateTime({
        autoCreate: true,
        columnName: 'created_at',
        serializeAs: 'created_at',
        serialize: (value: DateTime | null) => {
            return value ? value.toISO() : null
        }
    })
    declare createdAt: DateTime

    @column.dateTime({
        autoCreate: true,
        autoUpdate: true,
        columnName: 'updated_at',
        serializeAs: 'updated_at',
        serialize: (value: DateTime | null) => {
            return value ? value.toISO() : null
        }
    })
    declare updatedAt: DateTime

    @column.dateTime({
        columnName: 'deleted_at',
        serializeAs: 'deleted_at',
        serialize: (value: DateTime | null) => {
            return value ? value.toISO() : null
        }
    })
    declare deletedAt: DateTime | null

    // Relationships
    @hasMany(() => Appointment)
    declare appointments: HasMany<typeof Appointment>

    @hasMany(() => MedicalRecord)
    declare medicalRecords: HasMany<typeof MedicalRecord>

    @hasMany(() => Bill)
    declare bills: HasMany<typeof Bill>
}
