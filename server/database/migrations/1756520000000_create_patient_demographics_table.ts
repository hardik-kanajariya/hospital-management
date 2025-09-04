import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'patient_demographics'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('patient_id').notNullable().references('id').inTable('patients').onDelete('CASCADE')
      table.string('ethnicity', 100).nullable()
      table.string('race', 100).nullable()
      table.string('primary_language', 50).nullable()
      table.string('secondary_language', 50).nullable()
      table.enum('marital_status', ['single', 'married', 'divorced', 'widowed', 'separated', 'domestic_partnership']).nullable()
      table.string('occupation', 150).nullable()
      table.string('employer', 150).nullable()
      table.enum('education_level', ['none', 'elementary', 'high_school', 'some_college', 'bachelor', 'master', 'doctorate']).nullable()
      table.string('religion', 100).nullable()
      table.enum('preferred_contact_method', ['phone', 'email', 'sms', 'mail']).defaultTo('phone')
      table.string('preferred_contact_time', 50).nullable()
      table.json('emergency_contact_1').nullable()
      table.json('emergency_contact_2').nullable()
      table.json('next_of_kin').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      // Indexes
      table.index(['patient_id'])
      table.index(['ethnicity'])
      table.index(['marital_status'])
      table.index(['primary_language'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
