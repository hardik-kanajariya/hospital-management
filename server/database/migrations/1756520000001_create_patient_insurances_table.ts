import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'patient_insurances'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('patient_id').notNullable().references('id').inTable('patients').onDelete('CASCADE')
      table.enum('insurance_type', ['primary', 'secondary', 'tertiary']).notNullable()
      table.string('provider_name', 200).notNullable()
      table.string('policy_number', 100).notNullable()
      table.string('group_number', 100).nullable()
      table.string('subscriber_name', 255).notNullable()
      table.enum('subscriber_relationship', ['self', 'spouse', 'child', 'parent', 'other']).notNullable()
      table.date('subscriber_dob').nullable()
      table.date('effective_date').notNullable()
      table.date('expiry_date').nullable()
      table.decimal('copay_amount', 10, 2).nullable()
      table.decimal('deductible_amount', 10, 2).nullable()
      table.json('coverage_details').nullable()
      table.string('card_front_image', 500).nullable()
      table.string('card_back_image', 500).nullable()
      table.enum('verification_status', ['pending', 'verified', 'failed', 'expired']).defaultTo('pending')
      table.timestamp('verified_date').nullable()
      table.uuid('verified_by').nullable()
      table.enum('status', ['active', 'inactive', 'expired']).defaultTo('active')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      // Indexes
      table.index(['patient_id'])
      table.index(['provider_name'])
      table.index(['policy_number'])
      table.index(['verification_status'])
      table.index(['status'])
      table.unique(['patient_id', 'insurance_type'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
