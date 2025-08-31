import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'role_permissions'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.string('id', 36).primary()
            table.string('role_id', 36).notNullable()
            table.string('permission_id', 36).notNullable()
            table.json('actions').notNullable() // ['create', 'read', 'update', 'delete']

            table.timestamp('created_at').notNullable()
            table.timestamp('updated_at').notNullable()

            // Foreign keys
            table.foreign('role_id').references('id').inTable('roles').onDelete('CASCADE')
            table.foreign('permission_id').references('id').inTable('permissions').onDelete('CASCADE')

            // Unique constraint to prevent duplicate role-permission combinations
            table.unique(['role_id', 'permission_id'])

            // Indexes
            table.index(['role_id'])
            table.index(['permission_id'])
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
