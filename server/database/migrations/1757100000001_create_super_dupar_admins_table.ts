import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'super_dupar_admins'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary()
            table.string('email', 191).notNullable().unique()
            table.string('password_hash', 255).notNullable()
            table.string('name', 255).notNullable()
            table.string('phone', 20).nullable()
            table.boolean('is_active').defaultTo(true)
            table.timestamp('last_login_at').nullable()
            table.json('settings').nullable() // Personal settings
            table.json('permissions').nullable() // Additional permissions if needed

            table.timestamp('created_at').notNullable()
            table.timestamp('updated_at').notNullable()

            // Indexes
            table.index(['email'])
            table.index(['is_active'])
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
