import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'super_dupar_admin_activities'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary()
            table.uuid('super_dupar_admin_id').notNullable().references('id').inTable('super_dupar_admins').onDelete('CASCADE')
            table.string('action', 100).notNullable() // login, logout, create_super_admin, suspend_organization, etc.
            table.string('entity_type', 50).nullable() // organization, super_admin, user, etc.
            table.uuid('entity_id').nullable() // ID of the affected entity
            table.json('details').nullable() // Additional context about the action
            table.json('before_state').nullable() // State before the change
            table.json('after_state').nullable() // State after the change
            table.string('ip_address', 45).nullable()
            table.string('user_agent', 500).nullable()
            table.string('session_id', 255).nullable()
            table.enum('status', ['success', 'failed', 'pending']).defaultTo('success')
            table.text('error_message').nullable()

            table.timestamp('created_at').notNullable()

            // Indexes
            table.index(['super_dupar_admin_id'])
            table.index(['action'])
            table.index(['entity_type'])
            table.index(['entity_id'])
            table.index(['status'])
            table.index(['created_at'])
            table.index(['ip_address'])
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
