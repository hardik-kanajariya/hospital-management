import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'beds'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 36).primary()
      table.string('bed_number', 50).unique().notNullable()
      table.string('room_number', 50).notNullable()
      table.string('ward', 255).notNullable()
      table.string('floor', 50).notNullable()
      table.enum('type', ['general', 'private', 'icu', 'emergency', 'pediatric', 'maternity']).notNullable()
      table.enum('status', ['available', 'occupied', 'maintenance', 'cleaning', 'reserved']).defaultTo('available')
      table.string('patient_id', 36).nullable().references('id').inTable('patients').onDelete('SET NULL')
      table.datetime('admission_date').nullable()
      table.datetime('discharge_date').nullable()
      table.decimal('daily_rate', 10, 2).notNullable()
      table.json('features').nullable()
      table.text('notes').nullable()
      table.datetime('last_cleaned').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      // Indexes
      table.index(['bed_number'])
      table.index(['room_number'])
      table.index(['ward'])
      table.index(['status'])
      table.index(['type'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}