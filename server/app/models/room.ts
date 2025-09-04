import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, belongsTo, computed } from '@adonisjs/lucid/orm'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import Bed from './bed.js'
import MasterData from './master_data.js'

export default class Room extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column({ columnName: 'room_number' })
    declare roomNumber: string

    @column({ columnName: 'room_type' })
    declare roomType: string

    @column({ columnName: 'department_id' })
    declare departmentId: string

    @column()
    declare floor: number

    @column()
    declare capacity: number

    @column({
        columnName: 'amenities',
        prepare: (value: any) => JSON.stringify(value || []),
        consume: (value: string) => {
            try {
                return JSON.parse(value)
            } catch {
                return []
            }
        }
    })
    declare amenities: string[] | null

    @column({ columnName: 'daily_rate' })
    declare dailyRate: number

    @column()
    declare status: 'active' | 'maintenance' | 'inactive'

    @column()
    declare notes: string | null

    @column.dateTime({ autoCreate: true, columnName: 'created_at' })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
    declare updatedAt: DateTime

    @hasMany(() => Bed)
    declare beds: HasMany<typeof Bed>

    @belongsTo(() => MasterData, {
        foreignKey: 'departmentId',
    })
    declare department: BelongsTo<typeof MasterData>

    @computed()
    get occupiedBeds() {
        if (!this.beds) return 0
        return this.beds.filter(bed => bed.status === 'occupied').length
    }

    @computed()
    get availableBeds() {
        if (!this.beds) return this.capacity
        return this.beds.filter(bed => bed.status === 'available').length
    }

    @computed()
    get occupancyRate() {
        if (!this.capacity || this.capacity === 0) return 0
        return Math.round((this.occupiedBeds / this.capacity) * 100)
    }

    @computed()
    get maintenanceBeds() {
        if (!this.beds) return 0
        return this.beds.filter(bed => bed.status === 'maintenance').length
    }

    @computed()
    get cleaningBeds() {
        if (!this.beds) return 0
        return this.beds.filter(bed => bed.status === 'cleaning').length
    }

    @computed()
    get reservedBeds() {
        if (!this.beds) return 0
        return this.beds.filter(bed => bed.status === 'reserved').length
    }
}
