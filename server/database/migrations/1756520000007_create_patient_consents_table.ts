import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'patient_consents'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('patient_id').notNullable().references('id').inTable('patients').onDelete('CASCADE')
      table.enum('consent_type', ['treatment', 'data-sharing', 'research', 'photography', 'marketing']).notNullable()
      table.string('consent_form_id', 100).nullable()
      table.enum('status', ['granted', 'revoked', 'expired']).defaultTo('granted')
      table.timestamp('granted_date').notNullable()
      table.date('expiry_date').nullable()
      table.timestamp('revoked_date').nullable()
      table.string('witness_name', 255).nullable()
      table.text('witness_signature').nullable()
      table.text('patient_signature').nullable()
      table.text('guardian_signature').nullable()
      table.string('document_path', 500).nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      // Indexes
      table.index(['patient_id'])
      table.index(['consent_type'])
      table.index(['status'])
      table.index(['granted_date'])
      table.index(['expiry_date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
