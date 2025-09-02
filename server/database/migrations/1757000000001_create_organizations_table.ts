import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'organizations'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary()
            table.string('name', 255).notNullable()
            table.string('type', 50).nullable() // hospital, clinic, pharmacy, etc.
            table.string('registration_number', 100).nullable().unique()
            table.text('address').nullable()
            table.string('phone', 20).nullable()
            table.string('email', 191).nullable()
            table.string('website', 255).nullable()
            table.enum('status', ['active', 'inactive', 'suspended']).defaultTo('active')
            table.json('settings').nullable() // Organization-specific settings
            table.json('branding').nullable() // Logo, colors, theme
            table.string('timezone', 50).defaultTo('UTC')
            table.string('currency', 3).defaultTo('USD')
            table.string('language', 5).defaultTo('en')

            table.timestamp('created_at').notNullable()
            table.timestamp('updated_at').notNullable()

            // Indexes
            table.index(['name'])
            table.index(['type'])
            table.index(['status'])
            table.index(['registration_number'])
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
