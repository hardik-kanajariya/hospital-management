import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class SystemSetting extends BaseModel {
    public static table = 'system_settings'

    @column({ isPrimary: true })
    declare id: number

    @column()
    declare category: string

    @column()
    declare key: string

    @column()
    declare value: string

    @column()
    declare type: 'string' | 'number' | 'boolean' | 'json'

    @column()
    declare description: string | null

    @column()
    declare isEditable: boolean

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    // Helper method to get typed value
    public getTypedValue(): any {
        switch (this.type) {
            case 'number':
                return parseFloat(this.value)
            case 'boolean':
                return this.value === 'true'
            case 'json':
                try {
                    return JSON.parse(this.value)
                } catch {
                    return null
                }
            default:
                return this.value
        }
    }

    // Helper method to set typed value
    public setTypedValue(value: any): void {
        switch (this.type) {
            case 'number':
                this.value = value.toString()
                break
            case 'boolean':
                this.value = value ? 'true' : 'false'
                break
            case 'json':
                this.value = JSON.stringify(value)
                break
            default:
                this.value = value.toString()
        }
    }
}
