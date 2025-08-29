import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Patient from './patient.js'
import Doctor from './doctor.js'

export default class LabTest extends BaseModel {
    public static table = 'lab_tests'

    @column({ isPrimary: true })
    declare id: string

    @column({ columnName: 'test_id' })
    declare testId: string

    @column({ columnName: 'patient_id' })
    declare patientId: string

    @column({ columnName: 'doctor_id' })
    declare doctorId: string

    @column({ columnName: 'test_name' })
    declare testName: string

    @column({ columnName: 'test_type' })
    declare testType: string

    @column()
    declare category: string

    @column()
    declare description: string | null

    @column.dateTime({ columnName: 'ordered_date' })
    declare orderedDate: DateTime

    @column.dateTime({ columnName: 'sample_collected_date' })
    declare sampleCollectedDate: DateTime | null

    @column.dateTime({ columnName: 'result_date' })
    declare resultDate: DateTime | null

    @column()
    declare status: 'ordered' | 'sample_collected' | 'in_progress' | 'completed' | 'cancelled'

    @column()
    declare priority: 'normal' | 'urgent' | 'stat'

    @column({
        columnName: 'results',
        prepare: (value: any) => JSON.stringify(value || {}),
        consume: (value: string) => {
            try {
                return JSON.parse(value)
            } catch {
                return {}
            }
        }
    })
    declare results: Record<string, any>

    @column({
        columnName: 'reference_ranges',
        prepare: (value: any) => JSON.stringify(value || {}),
        consume: (value: string) => {
            try {
                return JSON.parse(value)
            } catch {
                return {}
            }
        }
    })
    declare referenceRanges: Record<string, any>

    @column()
    declare interpretation: string | null

    @column()
    declare notes: string | null

    @column({ columnName: 'technician_id' })
    declare technicianId: string | null

    @column({ columnName: 'verified_by' })
    declare verifiedBy: string | null

    @column.dateTime({ columnName: 'verified_at' })
    declare verifiedAt: DateTime | null

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
}
