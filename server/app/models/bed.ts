import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Patient from './patient.js'
import Room from './room.js'

export default class Bed extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column({ columnName: 'room_id' })
    declare roomId: string

    @column({ columnName: 'bed_number' })
    declare bedNumber: string

    @column({ columnName: 'room_number' })
    declare roomNumber: string

    @column()
    declare ward: string

    @column()
    declare floor: string

    @column()
    declare type: string

    @column()
    declare status: string

    @column({ columnName: 'patient_id' })
    declare patientId: string | null

    @column({ columnName: 'current_patient_id' })
    declare currentPatientId: string | null

    @column.dateTime({ columnName: 'admission_date' })
    declare admissionDate: DateTime | null

    @column.dateTime({ columnName: 'discharge_date' })
    declare dischargeDate: DateTime | null

    @column.dateTime({ columnName: 'expected_discharge_date' })
    declare expectedDischargeDate: DateTime | null

    @column({ columnName: 'daily_rate' })
    declare dailyRate: number

    @column({
        columnName: 'features',
        prepare: (value: any) => JSON.stringify(value || []),
        consume: (value: string) => {
            try {
                return JSON.parse(value)
            } catch {
                return []
            }
        }
    })
    declare features: string[]

    @column()
    declare notes: string | null

    @column.dateTime({ columnName: 'last_cleaned' })
    declare lastCleaned: DateTime | null

    @column.dateTime({ columnName: 'last_maintained' })
    declare lastMaintained: DateTime | null

    @column.dateTime({ autoCreate: true, columnName: 'created_at' })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
    declare updatedAt: DateTime

    // Relationships
    @belongsTo(() => Patient, {
        foreignKey: 'patientId'
    })
    declare patient: BelongsTo<typeof Patient>

    @belongsTo(() => Patient, {
        foreignKey: 'currentPatientId'
    })
    declare currentPatient: BelongsTo<typeof Patient>

    @belongsTo(() => Room)
    declare room: BelongsTo<typeof Room>

    async markAsOccupied(patientId: string, admissionDate: DateTime, expectedDischarge?: DateTime) {
        this.status = 'occupied'
        this.currentPatientId = patientId
        this.patientId = patientId // Keep for backward compatibility
        this.admissionDate = admissionDate
        this.expectedDischargeDate = expectedDischarge || null
        await this.save()
    }

    async markAsAvailable() {
        this.status = 'available'
        this.currentPatientId = null
        this.patientId = null // Keep for backward compatibility
        this.admissionDate = null
        this.dischargeDate = DateTime.now()
        this.expectedDischargeDate = null
        this.lastCleaned = DateTime.now()
        await this.save()
    }

    async markAsCleaned() {
        this.lastCleaned = DateTime.now()
        await this.save()
    }

    async markAsMaintained() {
        this.lastMaintained = DateTime.now()
        await this.save()
    }
}
