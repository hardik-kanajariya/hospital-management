import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'admissions'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary()
            table.string('admission_number', 50).notNullable().unique()
            table.uuid('patient_id').notNullable().references('id').inTable('patients')
            table.uuid('bed_id').notNullable().references('id').inTable('beds')
            table.uuid('admitting_doctor_id').notNullable().references('id').inTable('user_role_data')
            table.datetime('admission_date').notNullable()
            table.datetime('expected_discharge_date').nullable()
            table.datetime('actual_discharge_date').nullable()
            table.enum('status', ['active', 'discharged', 'transferred']).defaultTo('active')
            table.text('chief_complaint').nullable()
            table.text('diagnosis').nullable()
            table.text('admission_notes').nullable()
            table.text('discharge_notes').nullable()
            table.string('discharge_type', 50).nullable() // Will reference master_data
            table.uuid('transferred_to_bed_id').references('id').inTable('beds').nullable()
            table.uuid('created_by').notNullable().references('id').inTable('users')
            table.uuid('updated_by').nullable().references('id').inTable('users')

            table.timestamp('created_at')
            table.timestamp('updated_at')

            table.index(['patient_id', 'status'])
            table.index(['bed_id', 'status'])
            table.index('admission_date')
            table.index('admitting_doctor_id')
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
