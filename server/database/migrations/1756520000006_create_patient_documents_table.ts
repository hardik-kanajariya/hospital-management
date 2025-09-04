import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'patient_documents'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary()
            table.uuid('patient_id').notNullable().references('id').inTable('patients').onDelete('CASCADE')
            table.enum('document_type', ['consent', 'insurance', 'id', 'medical', 'other']).notNullable()
            table.string('document_name', 255).notNullable()
            table.string('file_path', 500).notNullable()
            table.bigInteger('file_size').notNullable()
            table.string('mime_type', 100).notNullable()
            table.text('description').nullable()
            table.uuid('uploaded_by').notNullable()
            table.boolean('is_verified').defaultTo(false)
            table.uuid('verified_by').nullable()
            table.date('expiry_date').nullable()
            table.json('tags').nullable()
            table.json('metadata').nullable()

            table.timestamp('created_at').notNullable()
            table.timestamp('updated_at').notNullable()

            // Indexes
            table.index(['patient_id'])
            table.index(['document_type'])
            table.index(['uploaded_by'])
            table.index(['is_verified'])
            table.index(['expiry_date'])
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
