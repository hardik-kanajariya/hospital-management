import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'lab_tests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 36).primary()
      table.string('test_id', 20).unique().notNullable()
      table.string('patient_id', 36).notNullable().references('id').inTable('patients').onDelete('CASCADE')
      table.string('doctor_id', 36).notNullable().references('id').inTable('doctors').onDelete('CASCADE')
      table.string('test_name', 255).notNullable()
      table.string('test_type', 255).notNullable()
      table.string('category', 255).notNullable()
      table.text('description').nullable()
      table.datetime('ordered_date').notNullable()
      table.datetime('sample_collected_date').nullable()
      table.datetime('result_date').nullable()
      table.enum('status', ['ordered', 'sample_collected', 'in_progress', 'completed', 'cancelled']).defaultTo('ordered')
      table.enum('priority', ['normal', 'urgent', 'stat']).defaultTo('normal')
      table.json('results').nullable()
      table.json('reference_ranges').nullable()
      table.text('interpretation').nullable()
      table.text('notes').nullable()
      table.string('technician_id', 36).nullable()
      table.string('verified_by', 36).nullable()
      table.datetime('verified_at').nullable()
      table.json('attachments').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      // Indexes
      table.index(['test_id'])
      table.index(['patient_id'])
      table.index(['doctor_id'])
      table.index(['status'])
      table.index(['ordered_date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}