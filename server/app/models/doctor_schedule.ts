import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, computed, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import { v4 as uuid } from 'uuid'

export default class DoctorSchedule extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column()
    declare userId: string

    @column()
    declare dayOfWeek: string

    @column()
    declare startTime: string

    @column()
    declare endTime: string

    @column()
    declare location: string

    @column()
    declare maxPatients: number

    @column()
    declare slotDurationMinutes: number

    @column()
    declare scheduleType: string

    @column()
    declare status: string

    @column()
    declare notes: string | null

    @column({
        prepare: (value: any) => JSON.stringify(value),
        consume: (value: string) => {
            try {
                return value ? JSON.parse(value) : []
            } catch {
                return []
            }
        }
    })
    declare breakTimes: Array<{ start_time: string; end_time: string; label?: string }>

    @column()
    declare isRecurring: boolean

    @column.date()
    declare effectiveFrom: DateTime

    @column.date()
    declare effectiveUntil: DateTime | null

    @column()
    declare priority: number

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

    @belongsTo(() => User, { foreignKey: 'createdBy' })
    declare creator: BelongsTo<typeof User>

    @belongsTo(() => User, { foreignKey: 'updatedBy' })
    declare updater: BelongsTo<typeof User>

    // Computed properties
    @computed()
    get totalSlots(): number {
        const start = DateTime.fromFormat(this.startTime, 'HH:mm')
        const end = DateTime.fromFormat(this.endTime, 'HH:mm')
        const durationMs = end.diff(start).milliseconds

        // Subtract break times
        let breakDurationMs = 0
        this.breakTimes.forEach(breakTime => {
            const breakStart = DateTime.fromFormat(breakTime.start_time, 'HH:mm')
            const breakEnd = DateTime.fromFormat(breakTime.end_time, 'HH:mm')
            breakDurationMs += breakEnd.diff(breakStart).milliseconds
        })

        const availableDurationMs = durationMs - breakDurationMs
        const slotDurationMs = this.slotDurationMinutes * 60 * 1000

        return Math.floor(availableDurationMs / slotDurationMs)
    }

    @computed()
    get duration(): string {
        const start = DateTime.fromFormat(this.startTime, 'HH:mm')
        const end = DateTime.fromFormat(this.endTime, 'HH:mm')
        const duration = end.diff(start, ['hours', 'minutes'])

        const hours = Math.floor(duration.hours)
        const minutes = Math.floor(duration.minutes % 60)

        return `${hours}h ${minutes}m`
    }

    // Hooks
    @beforeCreate()
    static assignUuid(schedule: DoctorSchedule) {
        schedule.id = uuid()
    }

    // Methods
    public async getAvailableTimeSlots(): Promise<Array<{ start: string; end: string; isAvailable: boolean }>> {
        const slots: Array<{ start: string; end: string; isAvailable: boolean }> = []

        const start = DateTime.fromFormat(this.startTime, 'HH:mm')
        let current = start
        const end = DateTime.fromFormat(this.endTime, 'HH:mm')

        while (current < end) {
            const slotEnd = current.plus({ minutes: this.slotDurationMinutes })

            // Check if slot overlaps with break times
            const isInBreak = this.breakTimes.some(breakTime => {
                const breakStart = DateTime.fromFormat(breakTime.start_time, 'HH:mm')
                const breakEnd = DateTime.fromFormat(breakTime.end_time, 'HH:mm')
                return current >= breakStart && slotEnd <= breakEnd
            })

            if (!isInBreak && slotEnd <= end) {
                slots.push({
                    start: current.toFormat('HH:mm'),
                    end: slotEnd.toFormat('HH:mm'),
                    isAvailable: true // Will be checked against appointments separately
                })
            }

            current = slotEnd
        }

        return slots
    }

    public isValidTimeRange(): boolean {
        const start = DateTime.fromFormat(this.startTime, 'HH:mm')
        const end = DateTime.fromFormat(this.endTime, 'HH:mm')
        return end > start
    }

    public hasConflictWith(otherSchedule: DoctorSchedule): boolean {
        if (this.userId !== otherSchedule.userId || this.dayOfWeek !== otherSchedule.dayOfWeek) {
            return false
        }

        const thisStart = DateTime.fromFormat(this.startTime, 'HH:mm')
        const thisEnd = DateTime.fromFormat(this.endTime, 'HH:mm')
        const otherStart = DateTime.fromFormat(otherSchedule.startTime, 'HH:mm')
        const otherEnd = DateTime.fromFormat(otherSchedule.endTime, 'HH:mm')

        return (thisStart < otherEnd && thisEnd > otherStart)
    }

    public serialize() {
        return {
            ...super.serialize(),
            totalSlots: this.totalSlots,
            duration: this.duration
        }
    }
}
