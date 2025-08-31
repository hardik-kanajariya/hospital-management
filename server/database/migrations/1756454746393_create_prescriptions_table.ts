import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'prescriptions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 36).primary()
      table.string('prescription_id', 20).unique().notNullable()
      table.string('patient_id', 36).notNullable().references('id').inTable('patients').onDelete('CASCADE')
      table.string('doctor_id', 36).notNullable().references('id').inTable('doctors').onDelete('CASCADE')
      table.string('appointment_id', 36).nullable().references('id').inTable('appointments').onDelete('SET NULL')
      table.date('prescription_date').notNullable()
      table.json('medications').nullable()
      table.text('diagnosis').notNullable()
      table.text('instructions').nullable()
      table.text('notes').nullable()
      table.enum('status', ['active', 'dispensed', 'completed', 'cancelled']).defaultTo('active')
      table.date('valid_until').nullable()
      table.string('dispensed_by', 36).nullable()
      table.datetime('dispensed_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      // Indexes
      table.index(['prescription_id'])
      table.index(['patient_id'])
      table.index(['doctor_id'])
      table.index(['status'])
      table.index(['prescription_date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}