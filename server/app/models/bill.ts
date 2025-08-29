import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Patient from './patient.js'
import Appointment from './appointment.js'

export default class Bill extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column({ columnName: 'bill_id' })
    declare billId: string

    @column({ columnName: 'patient_id' })
    declare patientId: string

    @column({ columnName: 'appointment_id' })
    declare appointmentId: string | null

    @column({ columnName: 'bill_date' })
    declare billDate: DateTime

    @column({ columnName: 'due_date' })
    declare dueDate: DateTime

    @column({
        columnName: 'services',
        prepare: (value: any) => JSON.stringify(value || []),
        consume: (value: string) => {
            try {
                return JSON.parse(value)
            } catch {
                return []
            }
        }
    })
    declare services: Record<string, any>[]

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

    @column({ columnName: 'subtotal' })
    declare subtotal: number

    @column({ columnName: 'tax_amount' })
    declare taxAmount: number

    @column({ columnName: 'discount_amount' })
    declare discountAmount: number

    @column({ columnName: 'total_amount' })
    declare totalAmount: number

    @column({ columnName: 'paid_amount' })
    declare paidAmount: number

    @column({ columnName: 'outstanding_amount' })
    declare outstandingAmount: number

    @column()
    declare status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'

    @column({ columnName: 'payment_method' })
    declare paymentMethod: 'cash' | 'card' | 'insurance' | 'bank_transfer' | 'other' | null

    @column({
        columnName: 'insurance_details',
        prepare: (value: any) => JSON.stringify(value || {}),
        consume: (value: string) => {
            try {
                return JSON.parse(value)
            } catch {
                return {}
            }
        }
    })
    declare insuranceDetails: Record<string, any>

    @column()
    declare notes: string | null

    @column.dateTime({ autoCreate: true, columnName: 'created_at' })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
    declare updatedAt: DateTime

    // Relationships
    @belongsTo(() => Patient)
    declare patient: BelongsTo<typeof Patient>

    @belongsTo(() => Appointment)
    declare appointment: BelongsTo<typeof Appointment>
}
