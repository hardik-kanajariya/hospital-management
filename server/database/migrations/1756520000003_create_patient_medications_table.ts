import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'patient_medications'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary()
            table.uuid('patient_id').notNullable().references('id').inTable('patients').onDelete('CASCADE')
            table.string('medication_name', 255).notNullable()
            table.string('generic_name', 255).nullable()
            table.string('dosage', 100).notNullable()
            table.string('frequency', 100).notNullable()
            table.string('route', 50).nullable()
            table.date('start_date').notNullable()
            table.date('end_date').nullable()
            table.uuid('prescribed_by').nullable()
            table.string('pharmacy_name', 255).nullable()
            table.string('reason', 500).nullable()
            table.enum('status', ['active', 'discontinued', 'completed']).defaultTo('active')
            table.text('adherence_notes').nullable()

            table.timestamp('created_at').notNullable()
            table.timestamp('updated_at').notNullable()

            // Indexes
            table.index(['patient_id'])
            table.index(['medication_name'])
            table.index(['status'])
            table.index(['start_date'])
            table.index(['prescribed_by'])
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
