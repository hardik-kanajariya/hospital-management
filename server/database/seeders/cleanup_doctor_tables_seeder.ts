import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Database from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    // Drop the incorrectly named table if it exists
    await Database.rawQuery('DROP TABLE IF EXISTS `doctor_availability`')
    console.log('Dropped doctor_availability table if it existed')
    
    // Check if doctor_availabilities table exists
    const result = await Database.rawQuery("SHOW TABLES LIKE 'doctor_availabilities'")
    console.log('doctor_availabilities table exists:', result[0].length > 0)
    
    // Show all doctor-related tables
    const doctorTables = await Database.rawQuery("SHOW TABLES LIKE 'doctor%'")
    console.log('Doctor tables:', doctorTables[0])
  }
}
