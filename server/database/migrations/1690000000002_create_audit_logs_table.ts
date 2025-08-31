import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'audit_logs'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id').primary()
            table.integer('user_id').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL')
            table.string('action', 100).notNullable().index()
            table.text('description').notNullable()
            table.enum('type', ['system', 'user', 'role', 'permission', 'setting', 'backup', 'login', 'logout']).notNullable().index()
            table.string('entity_type', 50).nullable()
            table.string('entity_id', 100).nullable()
            table.string('ip_address', 45).nullable()
            table.text('user_agent').nullable()
            table.json('metadata').nullable()
            table.timestamp('created_at')
            table.timestamp('updated_at')

            // Indexes for better performance
            table.index(['type', 'created_at'])
            table.index(['user_id', 'created_at'])
            table.index(['action', 'created_at'])
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
