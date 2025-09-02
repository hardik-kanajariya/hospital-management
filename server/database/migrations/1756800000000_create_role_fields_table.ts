import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'role_fields'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary()
            table.uuid('role_id').notNullable().references('id').inTable('roles').onDelete('CASCADE')
            table.string('field_name', 100).notNullable()
            table.string('field_label', 150).notNullable()
            table.enum('field_type', [
                'text',
                'email',
                'number',
                'decimal',
                'boolean',
                'date',
                'datetime',
                'select',
                'multi_select',
                'textarea',
                'file',
                'phone',
                'url'
            ]).notNullable()
            table.json('field_options').nullable() // For select options, validation rules, etc.
            table.boolean('is_required').defaultTo(false)
            table.integer('sort_order').defaultTo(0)
            table.boolean('is_active').defaultTo(true)
            table.text('description').nullable()
            table.json('validation_rules').nullable() // Custom validation rules
            table.timestamp('created_at', { useTz: true }).notNullable()
            table.timestamp('updated_at', { useTz: true }).notNullable()

            // Ensure unique field names per role
            table.unique(['role_id', 'field_name'])
            table.index(['role_id', 'is_active'])
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
