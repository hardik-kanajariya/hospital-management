import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'master_data'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id').primary()
            table.string('category', 50).notNullable().index()
            table.string('name', 100).notNullable()
            table.text('description').nullable()
            table.string('value', 100).nullable().index()
            table.integer('display_order').defaultTo(0).index()
            table.boolean('is_system').defaultTo(false).comment('System items cannot be deleted')
            table.boolean('is_active').defaultTo(true).index()
            table.json('metadata').nullable().comment('Additional data as JSON')
            table.timestamps(true)

            // Composite unique index for category + name
            table.unique(['category', 'name'])
            // Composite index for category + display_order for efficient sorting
            table.index(['category', 'display_order'])
            // Composite index for category + is_active for filtered lists
            table.index(['category', 'is_active'])
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
