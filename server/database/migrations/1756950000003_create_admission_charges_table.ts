import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'admission_charges'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary()
            table.uuid('admission_id').notNullable().references('id').inTable('admissions')
            table.string('charge_type', 50).notNullable() // Will reference master_data
            table.string('description').notNullable()
            table.decimal('amount', 10, 2).notNullable()
            table.integer('quantity').defaultTo(1)
            table.decimal('total_amount', 10, 2).notNullable()
            table.date('charge_date').notNullable()
            table.boolean('is_billable').defaultTo(true)
            table.uuid('bill_id').references('id').inTable('bills').nullable()
            table.uuid('created_by').notNullable().references('id').inTable('users')

            table.timestamp('created_at')
            table.timestamp('updated_at')

            table.index(['admission_id', 'charge_type'])
            table.index('charge_date')
            table.index('bill_id')
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
