import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'user_roles'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.raw('(UUID())'))
            table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
            table.uuid('role_id').notNullable().references('id').inTable('roles').onDelete('CASCADE')
            table.timestamp('assigned_at').defaultTo(this.now())
            table.uuid('assigned_by').nullable().references('id').inTable('users').onDelete('SET NULL')
            table.timestamp('expires_at').nullable() // For temporary role assignments
            table.boolean('is_active').defaultTo(true)

            table.timestamp('created_at').notNullable()
            table.timestamp('updated_at').notNullable()

            // Unique constraint for user-role combination
            table.unique(['user_id', 'role_id'])

            // Indexes
            table.index(['user_id'])
            table.index(['role_id'])
            table.index(['assigned_by'])
            table.index(['is_active'])
            table.index(['expires_at'])
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
