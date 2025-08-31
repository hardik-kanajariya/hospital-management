import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'permissions'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.string('id', 36).primary()
            table.string('name', 100).notNullable().unique()
            table.string('display_name', 255).notNullable()
            table.string('module', 100).notNullable()
            table.text('description').nullable()
            table.boolean('is_active').defaultTo(true)

            table.timestamp('created_at').notNullable()
            table.timestamp('updated_at').notNullable()

            // Indexes
            table.index(['name'])
            table.index(['module'])
            table.index(['is_active'])
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
