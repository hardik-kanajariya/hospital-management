import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'medical_records'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('record_id', 20).unique().notNullable()
      table.uuid('patient_id').notNullable().references('id').inTable('patients').onDelete('CASCADE')
      table.uuid('doctor_id').notNullable().references('id').inTable('doctors').onDelete('CASCADE')
      table.uuid('appointment_id').nullable().references('id').inTable('appointments').onDelete('SET NULL')
      table.datetime('visit_date').notNullable()
      table.text('diagnosis').notNullable()
      table.text('treatment').notNullable()
      table.json('medications').nullable()
      table.json('lab_results').nullable()
      table.json('vital_signs').nullable()
      table.text('notes').nullable()
      table.json('follow_up_instructions').nullable()
      table.datetime('next_visit_date').nullable()
      table.json('attachments').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      // Indexes
      table.index(['record_id'])
      table.index(['patient_id'])
      table.index(['doctor_id'])
      table.index(['visit_date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}