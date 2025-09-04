import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'patient_immunizations'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary()
            table.uuid('patient_id').notNullable().references('id').inTable('patients').onDelete('CASCADE')
            table.string('vaccine_name', 255).notNullable()
            table.string('vaccine_code', 50).nullable()
            table.integer('dose_number').notNullable()
            table.date('administration_date').notNullable()
            table.string('administration_site', 100).nullable()
            table.string('lot_number', 100).nullable()
            table.string('manufacturer', 200).nullable()
            table.date('expiry_date').nullable()
            table.uuid('administered_by').nullable()
            table.date('next_due_date').nullable()
            table.text('reaction_notes').nullable()

            table.timestamp('created_at').notNullable()
            table.timestamp('updated_at').notNullable()

            // Indexes
            table.index(['patient_id'])
            table.index(['vaccine_name'])
            table.index(['administration_date'])
            table.index(['next_due_date'])
            table.index(['administered_by'])
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
