import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'patient_portal_access'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('patient_id').notNullable().references('id').inTable('patients').onDelete('CASCADE')
      table.string('username', 100).unique().notNullable()
      table.string('email', 191).unique().notNullable()
      table.string('password_hash', 255).notNullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamp('last_login').nullable()
      table.integer('login_attempts').defaultTo(0)
      table.timestamp('locked_until').nullable()
      table.boolean('two_factor_enabled').defaultTo(false)
      table.string('two_factor_secret', 255).nullable()
      table.string('password_reset_token', 255).nullable()
      table.timestamp('password_reset_expires').nullable()
      table.boolean('email_verified').defaultTo(false)
      table.string('email_verification_token', 255).nullable()
      table.json('preferences').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      // Indexes
      table.index(['patient_id'])
      table.index(['email'])
      table.index(['is_active'])
      table.index(['email_verified'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
