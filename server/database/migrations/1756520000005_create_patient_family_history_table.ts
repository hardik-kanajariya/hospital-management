import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'patient_family_history'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('patient_id').notNullable().references('id').inTable('patients').onDelete('CASCADE')
      table.enum('relationship', ['father', 'mother', 'sibling', 'grandparent', 'aunt', 'uncle', 'cousin', 'other']).notNullable()
      table.string('condition', 255).notNullable()
      table.integer('age_at_diagnosis').nullable()
      table.enum('current_status', ['living', 'deceased', 'unknown']).nullable()
      table.text('notes').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      // Indexes
      table.index(['patient_id'])
      table.index(['relationship'])
      table.index(['condition'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
