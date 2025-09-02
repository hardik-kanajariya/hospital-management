import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('email', 191).notNullable().unique()
      table.string('password_hash', 255).notNullable()
      table.string('name', 255).notNullable()
      table.enum('role', [
        'super_admin',
        'doctor',
        'billing_manager',
        'nurse',
        'lab_technician',
        'pharmacist',
        'medical_store_manager',
        'receptionist'
      ]).notNullable()
      table.json('permissions').nullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamp('last_login').nullable()
      table.string('phone', 20).nullable()
      table.string('department').nullable()
      table.string('employee_id', 50).nullable().unique()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      // Indexes
      table.index(['email'])
      table.index(['role'])
      table.index(['is_active'])
      table.index(['employee_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}