import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'patient_allergies'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('patient_id').notNullable().references('id').inTable('patients').onDelete('CASCADE')
      table.enum('allergy_type', ['drug', 'food', 'environmental', 'other']).notNullable()
      table.string('allergen', 255).notNullable()
      table.enum('severity', ['mild', 'moderate', 'severe', 'life-threatening']).notNullable()
      table.string('reaction_type', 255).nullable()
      table.date('onset_date').nullable()
      table.text('notes').nullable()
      table.enum('status', ['active', 'inactive', 'resolved']).defaultTo('active')
      table.string('reported_by', 255).nullable()
      table.uuid('verified_by').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      // Indexes
      table.index(['patient_id'])
      table.index(['allergy_type'])
      table.index(['severity'])
      table.index(['status'])
      table.index(['allergen'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
