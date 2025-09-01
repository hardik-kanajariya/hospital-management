import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'doctor_availabilities'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.string('id').primary()
            table.string('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
            table.date('date').notNullable() // Specific date for availability override
            table.boolean('is_available').notNullable().defaultTo(true)
            table.string('availability_type').notNullable().defaultTo('override') // override, leave, emergency, holiday
            table.text('reason').nullable() // Reason for unavailability
            table.string('replacement_doctor_id').nullable().references('id').inTable('users') // Replacement doctor
            table.time('custom_start_time').nullable() // Override start time for the day
            table.time('custom_end_time').nullable() // Override end time for the day
            table.string('custom_location').nullable() // Override location for the day
            table.integer('custom_max_patients').nullable() // Override max patients for the day
            table.text('notes').nullable()
            table.boolean('notify_patients').notNullable().defaultTo(true) // Notify affected patients
            table.boolean('auto_reschedule').notNullable().defaultTo(false) // Auto-reschedule appointments

            // Audit fields
            table.string('created_by').nullable()
            table.string('updated_by').nullable()
            table.timestamp('created_at').defaultTo(this.now())
            table.timestamp('updated_at').defaultTo(this.now())
            table.timestamp('deleted_at').nullable()

            // Indexes for performance
            table.index(['user_id', 'date'])
            table.index(['date', 'is_available'])
            table.index(['replacement_doctor_id'])
            table.index(['availability_type'])

            // Unique constraint to prevent duplicate entries for same doctor/date
            table.unique(['user_id', 'date'])
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
