import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'inventories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('item_id', 20).unique().notNullable()
      table.string('name', 255).notNullable()
      table.text('description').nullable()
      table.enum('category', ['medication', 'equipment', 'supplies', 'other']).notNullable()
      table.string('manufacturer', 255).nullable()
      table.string('batch_number', 100).nullable()
      table.date('expiry_date').nullable()
      table.decimal('unit_price', 10, 2).notNullable()
      table.integer('quantity_in_stock').notNullable()
      table.integer('minimum_stock_level').notNullable()
      table.string('unit', 50).notNullable()
      table.string('location', 255).nullable()
      table.string('supplier_info', 500).nullable()
      table.enum('status', ['active', 'inactive', 'expired', 'out_of_stock']).defaultTo('active')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      // Indexes
      table.index(['item_id'])
      table.index(['name'])
      table.index(['category'])
      table.index(['status'])
      table.index(['expiry_date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}