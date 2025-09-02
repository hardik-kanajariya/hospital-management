import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'doctors'

    async up() {
        // Drop the doctors table since we're using dynamic role fields now
        this.schema.dropTableIfExists(this.tableName)
    }

    async down() {
        // Recreate the doctors table in case of rollback
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary()
            table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
            table.string('doctor_id', 50).notNullable().unique()
            table.string('specialization', 100).notNullable()
            table.string('qualification', 200).notNullable()
            table.integer('experience').notNullable()
            table.string('license_number', 100).notNullable()
            table.string('department', 100).notNullable()
            table.json('available_days').nullable()
            table.json('available_hours').nullable()
            table.decimal('consultation_fee', 10, 2).notNullable()
            table.boolean('is_available').defaultTo(true)
            table.timestamp('created_at', { useTz: true }).notNullable()
            table.timestamp('updated_at', { useTz: true }).notNullable()
        })
    }
}
