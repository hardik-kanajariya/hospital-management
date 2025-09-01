import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Inventory extends BaseModel {
    @column({ isPrimary: true })
    declare id: string

    @column({ columnName: 'item_id' })
    declare itemId: string

    @column()
    declare name: string

    @column()
    declare description: string | null

    @column()
    declare category: string

    @column()
    declare manufacturer: string | null

    @column({ columnName: 'batch_number' })
    declare batchNumber: string | null

    @column.date({ columnName: 'expiry_date' })
    declare expiryDate: DateTime | null

    @column({ columnName: 'unit_price' })
    declare unitPrice: number

    @column({ columnName: 'quantity_in_stock' })
    declare quantityInStock: number

    @column({ columnName: 'minimum_stock_level' })
    declare minimumStockLevel: number

    @column()
    declare unit: string

    @column()
    declare location: string | null

    @column({ columnName: 'supplier_info' })
    declare supplierInfo: string | null

    @column()
    declare status: string

    @column.dateTime({ autoCreate: true, columnName: 'created_at' })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
    declare updatedAt: DateTime
}
