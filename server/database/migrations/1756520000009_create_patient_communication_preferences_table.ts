import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'patient_communication_preferences'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary()
            table.uuid('patient_id').notNullable().references('id').inTable('patients').onDelete('CASCADE')
            table.boolean('appointment_reminders').defaultTo(true)
            table.enum('appointment_reminder_method', ['sms', 'email', 'call', 'all']).defaultTo('sms')
            table.integer('appointment_reminder_timing').defaultTo(24) // hours before
            table.boolean('lab_results_notification').defaultTo(true)
            table.enum('lab_results_method', ['sms', 'email', 'portal']).defaultTo('portal')
            table.boolean('billing_notifications').defaultTo(true)
            table.enum('billing_method', ['email', 'paper', 'both']).defaultTo('email')
            table.boolean('marketing_communications').defaultTo(false)
            table.boolean('health_tips').defaultTo(true)
            table.boolean('survey_participation').defaultTo(false)
            table.uuid('preferred_pharmacy_id').nullable()

            table.timestamp('created_at').notNullable()
            table.timestamp('updated_at').notNullable()

            // Indexes
            table.index(['patient_id'])
            table.unique(['patient_id'])
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
