import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Patient from './patient.js'

export default class PatientInsurance extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column()
    declare patientId: string

    @column()
    declare insuranceType: 'primary' | 'secondary' | 'tertiary'

    @column()
    declare providerName: string

    @column()
    declare policyNumber: string

    @column()
    declare groupNumber: string | null

    @column()
    declare subscriberName: string

    @column()
    declare subscriberRelationship: 'self' | 'spouse' | 'child' | 'parent' | 'other'

    @column.date()
    declare subscriberDob: DateTime | null

    @column.date()
    declare effectiveDate: DateTime

    @column.date()
    declare expiryDate: DateTime | null

    @column()
    declare copayAmount: number | null

    @column()
    declare deductibleAmount: number | null

    @column({
        prepare: (value: any) => JSON.stringify(value || {}),
        consume: (value: string | object) => {
            try {
                if (typeof value === 'object' && value !== null) {
                    return value
                }
                return JSON.parse(value as string || '{}')
            } catch {
                return {}
            }
        }
    })
    declare coverageDetails: Record<string, any>

    @column()
    declare cardFrontImage: string | null

    @column()
    declare cardBackImage: string | null

    @column()
    declare verificationStatus: 'pending' | 'verified' | 'failed' | 'expired'

    @column.dateTime()
    declare verifiedDate: DateTime | null

    @column()
    declare verifiedBy: string | null

    @column()
    declare status: 'active' | 'inactive' | 'expired'

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    // Relationships
    @belongsTo(() => Patient)
    declare patient: BelongsTo<typeof Patient>
}
