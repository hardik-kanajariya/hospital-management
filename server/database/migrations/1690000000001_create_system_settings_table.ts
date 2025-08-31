import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'system_settings'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id').primary()
            table.string('category', 50).notNullable().index()
            table.string('key', 100).notNullable().index()
            table.text('value').notNullable()
            table.enum('type', ['string', 'number', 'boolean', 'json']).defaultTo('string')
            table.text('description').nullable()
            table.boolean('is_editable').defaultTo(true)
            table.timestamp('created_at')
            table.timestamp('updated_at')

            // Unique constraint on category + key combination
            table.unique(['category', 'key'])
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
