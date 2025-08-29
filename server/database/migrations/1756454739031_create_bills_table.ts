import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'bills'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 36).primary()
      table.string('bill_id', 20).unique().notNullable()
      table.string('patient_id', 36).notNullable().references('id').inTable('patients').onDelete('CASCADE')
      table.string('appointment_id', 36).nullable().references('id').inTable('appointments').onDelete('SET NULL')
      table.datetime('bill_date').notNullable()
      table.datetime('due_date').notNullable()
      table.json('services').nullable()
      table.json('medications').nullable()
      table.decimal('subtotal', 10, 2).notNullable()
      table.decimal('tax_amount', 10, 2).defaultTo(0)
      table.decimal('discount_amount', 10, 2).defaultTo(0)
      table.decimal('total_amount', 10, 2).notNullable()
      table.decimal('paid_amount', 10, 2).defaultTo(0)
      table.decimal('outstanding_amount', 10, 2).notNullable()
      table.enum('status', ['pending', 'partial', 'paid', 'overdue', 'cancelled']).defaultTo('pending')
      table.enum('payment_method', ['cash', 'card', 'insurance', 'bank_transfer', 'other']).nullable()
      table.json('insurance_details').nullable()
      table.text('notes').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      // Indexes
      table.index(['bill_id'])
      table.index(['patient_id'])
      table.index(['bill_date'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}