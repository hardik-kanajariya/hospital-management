import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import { v4 as uuid } from 'uuid'

export default class DoctorAvailability extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column()
    declare userId: string

    @column.date()
    declare date: DateTime

    @column()
    declare isAvailable: boolean

    @column()
    declare availabilityType: string

    @column()
    declare reason: string | null

    @column()
    declare replacementDoctorId: string | null

    @column()
    declare customStartTime: string | null

    @column()
    declare customEndTime: string | null

    @column()
    declare customLocation: string | null

    @column()
    declare customMaxPatients: number | null

    @column()
    declare notes: string | null

    @column()
    declare notifyPatients: boolean

    @column()
    declare autoReschedule: boolean

    @column()
    declare createdBy: string | null

    @column()
    declare updatedBy: string | null

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    @column.dateTime()
    declare deletedAt: DateTime | null

    // Relationships
    @belongsTo(() => User, { foreignKey: 'userId' })
    declare doctor: BelongsTo<typeof User>

    @belongsTo(() => User, { foreignKey: 'replacementDoctorId' })
    declare replacementDoctor: BelongsTo<typeof User>

    @belongsTo(() => User, { foreignKey: 'createdBy' })
    declare creator: BelongsTo<typeof User>

    @belongsTo(() => User, { foreignKey: 'updatedBy' })
    declare updater: BelongsTo<typeof User>

    // Hooks
    @beforeCreate()
    static assignUuid(availability: DoctorAvailability) {
        availability.id = uuid()
    }

    // Methods
    public isOverride(): boolean {
        return this.availabilityType === 'override'
    }

    public isLeave(): boolean {
        return ['leave', 'sick_leave', 'vacation', 'emergency_leave'].includes(this.availabilityType)
    }

    public isEmergencyDuty(): boolean {
        return this.availabilityType === 'emergency_duty'
    }

    public hasReplacement(): boolean {
        return !!this.replacementDoctorId
    }

    public hasCustomTiming(): boolean {
        return !!(this.customStartTime && this.customEndTime)
    }

    public getEffectiveStartTime(): string | null {
        return this.customStartTime
    }

    public getEffectiveEndTime(): string | null {
        return this.customEndTime
    }

    public getEffectiveLocation(): string | null {
        return this.customLocation
    }

    public getEffectiveMaxPatients(): number | null {
        return this.customMaxPatients
    }
}
