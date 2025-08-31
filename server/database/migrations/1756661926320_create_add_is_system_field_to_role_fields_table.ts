import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'role_fields'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_system_field').defaultTo(false).after('is_active')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_system_field')
    })
  }
}