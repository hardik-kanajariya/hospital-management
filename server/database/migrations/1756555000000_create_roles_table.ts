import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'roles'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.string('id', 36).primary()
            table.string('name', 100).notNullable().unique()
            table.string('display_name', 255).notNullable()
            table.text('description').nullable()
            table.integer('access_level').notNullable().defaultTo(1)
            table.boolean('is_active').defaultTo(true)
            table.boolean('is_system_role').defaultTo(false) // For default roles that can't be deleted

            table.timestamp('created_at').notNullable()
            table.timestamp('updated_at').notNullable()

            // Indexes
            table.index(['name'])
            table.index(['is_active'])
            table.index(['is_system_role'])
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
