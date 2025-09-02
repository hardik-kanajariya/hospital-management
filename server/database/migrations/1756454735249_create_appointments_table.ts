import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'appointments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('appointment_id', 20).unique().notNullable()
      table.uuid('patient_id').notNullable().references('id').inTable('patients').onDelete('CASCADE')
      table.uuid('doctor_id').notNullable().references('id').inTable('doctors').onDelete('CASCADE')
      table.datetime('appointment_date').notNullable()
      table.datetime('appointment_time').notNullable()
      table.integer('duration').defaultTo(30) // in minutes
      table.enum('status', ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).defaultTo('scheduled')
      table.enum('type', ['consultation', 'follow_up', 'emergency', 'surgery', 'checkup']).defaultTo('consultation')
      table.enum('priority', ['normal', 'urgent', 'emergency']).defaultTo('normal')
      table.string('reason', 500).notNullable()
      table.text('notes').nullable()
      table.json('symptoms').nullable()
      table.json('vitals').nullable()
      table.datetime('checked_in_at').nullable()
      table.datetime('checked_out_at').nullable()
      table.string('room_number', 50).nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      // Indexes
      table.index(['appointment_id'])
      table.index(['patient_id'])
      table.index(['doctor_id'])
      table.index(['appointment_date'])
      table.index(['status'])
      table.index(['type'])
      table.index(['priority'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}