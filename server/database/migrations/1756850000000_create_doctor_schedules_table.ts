import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'doctor_schedules'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary()
            table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
            table.string('day_of_week', 100).notNullable() // Monday, Tuesday, etc.
            table.time('start_time').notNullable()
            table.time('end_time').notNullable()
            table.string('location', 100).notNullable().defaultTo('General OPD')
            table.integer('max_patients').notNullable().defaultTo(20)
            table.integer('slot_duration_minutes').notNullable().defaultTo(15) // Duration of each appointment slot
            table.string('schedule_type', 100).notNullable().defaultTo('regular') // regular, emergency, surgery, consultation
            table.string('status', 100).notNullable().defaultTo('active') // active, inactive, suspended
            table.text('notes').nullable()
            table.json('break_times').nullable() // Array of {start_time, end_time} for lunch breaks, etc.
            table.boolean('is_recurring').notNullable().defaultTo(true) // Weekly recurring or one-time
            table.date('effective_from').notNullable()
            table.date('effective_until').nullable() // Null means indefinite
            table.integer('priority').notNullable().defaultTo(1) // For conflict resolution

            // Audit fields
            table.string('created_by').nullable()
            table.string('updated_by').nullable()
            table.timestamp('created_at').defaultTo(this.now())
            table.timestamp('updated_at').defaultTo(this.now())
            table.timestamp('deleted_at').nullable()

            // Indexes for performance
            table.index(['user_id', 'day_of_week', 'status'])
            table.index(['day_of_week', 'status'])
            table.index(['location', 'schedule_type'])
            table.index(['effective_from', 'effective_until'])
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
