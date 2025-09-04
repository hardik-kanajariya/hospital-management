import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rooms'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('room_number', 50).notNullable().unique()
      table.string('room_type', 50).notNullable() // Will reference master_data
      table.uuid('department_id').references('id').inTable('master_data')
      table.integer('floor').notNullable()
      table.integer('capacity').defaultTo(1)
      table.json('amenities') // Array of amenity IDs from master_data
      table.decimal('daily_rate', 10, 2).notNullable()
      table.enum('status', ['active', 'maintenance', 'inactive']).defaultTo('active')
      table.text('notes').nullable()
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
      
      table.index(['room_type', 'status'])
      table.index('department_id')
      table.index('floor')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
