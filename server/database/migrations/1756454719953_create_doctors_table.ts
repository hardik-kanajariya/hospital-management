import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'doctors'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('doctor_id', 20).unique().notNullable()
      table.string('specialization', 255).notNullable()
      table.string('qualification', 500).notNullable()
      table.integer('experience').notNullable()
      table.string('license_number', 100).notNullable()
      table.string('department', 255).notNullable()
      table.json('available_days').nullable()
      table.json('available_hours').nullable()
      table.decimal('consultation_fee', 10, 2).notNullable()
      table.boolean('is_available').defaultTo(true)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      // Indexes
      table.index(['doctor_id'])
      table.index(['user_id'])
      table.index(['specialization'])
      table.index(['department'])
      table.index(['is_available'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}