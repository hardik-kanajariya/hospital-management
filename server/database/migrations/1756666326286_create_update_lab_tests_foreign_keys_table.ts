import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'lab_tests'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Drop the old foreign key constraint to doctors table
      table.dropForeign(['doctor_id'])

      // Add new foreign key constraint to users table
      table.foreign('doctor_id').references('id').inTable('users').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Drop the foreign key constraint to users table
      table.dropForeign(['doctor_id'])

      // Restore the old foreign key constraint to doctors table (if needed for rollback)
      table.foreign('doctor_id').references('id').inTable('doctors').onDelete('CASCADE')
    })
  }
}