import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'user_role_data'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary()
            table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
            table.uuid('role_field_id').notNullable().references('id').inTable('role_fields').onDelete('CASCADE')
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
