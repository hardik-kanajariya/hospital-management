import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('title', 255).notNullable()
      table.text('message').notNullable()
      table.enum('type', ['appointment', 'emergency', 'system', 'reminder', 'alert', 'info']).notNullable()
      table.enum('priority', ['low', 'medium', 'high', 'critical']).defaultTo('medium')
      table.boolean('is_read').defaultTo(false)
      table.json('data').nullable()
      table.string('action_url', 500).nullable()
      table.datetime('read_at').nullable()
      table.datetime('expires_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      // Indexes
      table.index(['user_id'])
      table.index(['type'])
      table.index(['priority'])
      table.index(['is_read'])
      table.index(['created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}