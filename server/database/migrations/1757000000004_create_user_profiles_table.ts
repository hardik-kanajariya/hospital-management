import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'user_profiles'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary()
            table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
            table.string('field_key', 100).notNullable()
            table.text('field_value').nullable()
            table.enum('field_type', [
                'text',
                'number',
                'date',
                'datetime',
                'boolean',
                'select',
                'multiselect',
                'file',
                'email',
                'phone',
                'url'
            ]).defaultTo('text')
            table.json('field_options').nullable() // For select options, validation rules, etc.
            table.boolean('is_required').defaultTo(false)
            table.boolean('is_visible').defaultTo(true)
            table.integer('sort_order').defaultTo(0)

            table.timestamp('created_at').notNullable()
            table.timestamp('updated_at').notNullable()

            // Indexes
            table.index(['user_id'])
            table.index(['field_key'])
            table.index(['is_visible'])
            table.unique(['user_id', 'field_key']) // One value per field per user
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
