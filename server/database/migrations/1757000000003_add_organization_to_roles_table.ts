import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'roles'

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            // Add organization_id foreign key for multi-tenancy
            table.uuid('organization_id').nullable().references('id').inTable('organizations').onDelete('CASCADE')

            // Add index
            table.index(['organization_id'])
        })
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropForeign(['organization_id'])
            table.dropColumn('organization_id')
        })
    }
}
