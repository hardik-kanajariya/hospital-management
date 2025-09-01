import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Database from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    // Delete the migration record for doctor availability
    await Database.rawQuery(`
      DELETE FROM adonis_schema 
      WHERE name = 'database/migrations/1756850000001_create_doctor_availability_table'
    `)
    console.log('Removed migration record for doctor availability table')
    
    // Show remaining migration records
    const migrations = await Database.rawQuery(`
      SELECT name, batch FROM adonis_schema 
      WHERE name LIKE '%doctor%'
    `)
    console.log('Doctor migration records:', migrations[0])
  }
}
