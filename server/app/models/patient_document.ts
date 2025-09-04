import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Patient from './patient.js'

export default class PatientDocument extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column()
    declare patientId: string

    @column()
    declare documentType: 'consent' | 'insurance' | 'id' | 'medical' | 'other'

    @column()
    declare documentName: string

    @column()
    declare filePath: string

    @column()
    declare fileSize: number

    @column()
    declare mimeType: string

    @column()
    declare description: string | null

    @column()
    declare uploadedBy: string

    @column()
    declare isVerified: boolean

    @column()
    declare verifiedBy: string | null

    @column.date()
    declare expiryDate: DateTime | null

    @column({
        prepare: (value: any) => JSON.stringify(value || []),
        consume: (value: string | any[]) => {
            try {
                if (Array.isArray(value)) {
                    return value
                }
                return JSON.parse(value as string || '[]')
            } catch {
                return []
            }
        }
    })
    declare tags: string[]

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
    declare metadata: Record<string, any>

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    // Relationships
    @belongsTo(() => Patient)
    declare patient: BelongsTo<typeof Patient>
}
