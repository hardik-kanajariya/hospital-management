import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import { v4 as uuid } from 'uuid'

export default class extends BaseSeeder {
  async run() {
    // Create default admin user
    await User.updateOrCreate(
      { email: 'admin@medcare.com' },
      {
        id: uuid(),
        email: 'admin@medcare.com',
        passwordHash: 'admin123', // Will be hashed by model hook
        name: 'System Administrator',
        role: 'super_admin',
        phone: '+1234567890',
        department: 'Administration',
        employeeId: 'EMP001',
        isActive: true,
        permissions: User.getPermissionsForRole('super_admin')
      }
    )

    // Create default doctor
    await User.updateOrCreate(
      { email: 'doctor@medcare.com' },
      {
        id: uuid(),
        email: 'doctor@medcare.com',
        passwordHash: 'doctor123', // Will be hashed by model hook
        name: 'Dr. John Smith',
        role: 'doctor',
        phone: '+1234567891',
        department: 'General Medicine',
        employeeId: 'DOC001',
        isActive: true,
        permissions: User.getPermissionsForRole('doctor')
      }
    )

    // Create default nurse
    await User.updateOrCreate(
      { email: 'nurse@medcare.com' },
      {
        id: uuid(),
        email: 'nurse@medcare.com',
        passwordHash: 'nurse123', // Will be hashed by model hook
        name: 'Nurse Jane Doe',
        role: 'nurse',
        phone: '+1234567892',
        department: 'General Ward',
        employeeId: 'NUR001',
        isActive: true,
        permissions: User.getPermissionsForRole('nurse')
      }
    )

    // Create default receptionist
    await User.updateOrCreate(
      { email: 'receptionist@medcare.com' },
      {
        id: uuid(),
        email: 'receptionist@medcare.com',
        passwordHash: 'reception123', // Will be hashed by model hook
        name: 'Mary Johnson',
        role: 'receptionist',
        phone: '+1234567893',
        department: 'Reception',
        employeeId: 'REC001',
        isActive: true,
        permissions: User.getPermissionsForRole('receptionist')
      }
    )

    console.log('✅ Default users created successfully')
  }
}