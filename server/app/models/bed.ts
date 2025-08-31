import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Patient from './patient.js'

export default class Bed extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column({ columnName: 'bed_number' })
    declare bedNumber: string

    @column({ columnName: 'room_number' })
    declare roomNumber: string

    @column()
    declare ward: string

    @column()
    declare floor: string

    @column()
    declare type: 'general' | 'private' | 'icu' | 'emergency' | 'pediatric' | 'maternity'

    @column()
    declare status: 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'reserved'

    @column({ columnName: 'patient_id' })
    declare patientId: string | null

    @column.dateTime({ columnName: 'admission_date' })
    declare admissionDate: DateTime | null

    @column.dateTime({ columnName: 'discharge_date' })
    declare dischargeDate: DateTime | null

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

    @column.dateTime({ autoCreate: true, columnName: 'created_at' })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
    declare updatedAt: DateTime

    // Relationships
    @belongsTo(() => Patient)
    declare patient: BelongsTo<typeof Patient>
}
