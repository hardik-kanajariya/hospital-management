import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'users'

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            // Drop the old enum role column
            table.dropColumn('role')

            // Add new role_id foreign key
            table.string('role_id', 36).nullable()

            // Add foreign key constraint
            table.foreign('role_id').references('id').inTable('roles').onDelete('SET NULL')

            // Add index
            table.index(['role_id'])
        })
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            // Drop foreign key and column
            table.dropForeign(['role_id'])
            table.dropColumn('role_id')

            // Restore old enum column
            table.enum('role', [
                'super_admin',
                'doctor',
                'billing_manager',
                'nurse',
                'lab_technician',
                'pharmacist',
                'medical_store_manager',
                'receptionist'
            ]).notNullable()
        })
    }
}
