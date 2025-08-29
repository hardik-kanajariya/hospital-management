import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'patients'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 36).primary()
      table.string('patient_id', 20).unique().notNullable()
      table.string('name', 255).notNullable()
      table.string('phone', 20).notNullable()
      table.string('email', 191).nullable()
      table.date('date_of_birth').notNullable()
      table.enum('gender', ['male', 'female', 'other']).notNullable()
      table.text('address').notNullable()
      table.json('emergency_contact').notNullable()
      table.enum('blood_group', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).nullable()
      table.json('allergies').nullable()
      table.json('chronic_conditions').nullable()
      table.json('vaccination_records').nullable()
      table.json('insurance_info').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      // Indexes
      table.index(['patient_id'])
      table.index(['phone'])
      table.index(['email'])
      table.index(['name'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
