import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'user_role_data'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.string('id', 36).primary()
            table.string('user_id', 36).notNullable().references('id').inTable('users').onDelete('CASCADE')
            table.string('role_field_id', 36).notNullable().references('id').inTable('role_fields').onDelete('CASCADE')
            table.text('field_value').nullable() // Store all values as text, cast based on field_type
            table.timestamp('created_at', { useTz: true }).notNullable()
            table.timestamp('updated_at', { useTz: true }).notNullable()

            // Ensure unique field values per user
            table.unique(['user_id', 'role_field_id'])
            table.index(['user_id'])
            table.index(['role_field_id'])
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
