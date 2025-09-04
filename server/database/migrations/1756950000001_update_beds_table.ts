import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'beds'

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            // Add room_id foreign key
            table.uuid('room_id').references('id').inTable('rooms').after('id')

            // Remove redundant fields that will be in rooms table
            // room_number will be kept for now to avoid breaking existing data
            // ward can be derived from room's department

            // Add new fields for better bed management
            table.datetime('last_maintained').nullable()
            table.uuid('current_patient_id').references('id').inTable('patients').nullable()
            table.datetime('expected_discharge_date').nullable()

            // Update indexes
            table.index('room_id')
            table.index('current_patient_id')
            table.unique(['room_id', 'bed_number'])
        })
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropForeign('room_id')
            table.dropForeign('current_patient_id')
            table.dropColumn('room_id')
            table.dropColumn('last_maintained')
            table.dropColumn('current_patient_id')
            table.dropColumn('expected_discharge_date')
        })
    }
}
