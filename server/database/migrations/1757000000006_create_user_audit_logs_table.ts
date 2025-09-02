import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'user_audit_logs'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary()
            table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL')
            table.uuid('organization_id').nullable().references('id').inTable('organizations').onDelete('CASCADE')
            table.string('action', 100).notNullable() // login, logout, create_user, update_role, etc.
            table.string('entity_type', 50).nullable() // user, role, permission, etc.
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
            table.index(['user_id'])
            table.index(['organization_id'])
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
