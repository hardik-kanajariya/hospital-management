import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Role from '#models/role'
import { v4 as uuid } from 'uuid'

export default class extends BaseSeeder {
  async run() {
    // Get all the roles we need
    const superAdminRole = await Role.findBy('name', 'super_admin')
    const doctorRole = await Role.findBy('name', 'doctor')
    const nurseRole = await Role.findBy('name', 'nurse')
    const receptionistRole = await Role.findBy('name', 'receptionist')
    const billingManagerRole = await Role.findBy('name', 'billing_manager')
    const labTechnicianRole = await Role.findBy('name', 'lab_technician')
    const pharmacistRole = await Role.findBy('name', 'pharmacist')
    const medicalStoreManagerRole = await Role.findBy('name', 'medical_store_manager')

    if (!superAdminRole || !doctorRole || !nurseRole || !receptionistRole) {
      console.error('Required roles not found. Please run role_permission_seeder first.')
      return
    }

    // Create super admin user
    await User.updateOrCreate(
      { email: 'admin@medcare.com' },
      {
        id: uuid(),
        email: 'admin@medcare.com',
        passwordHash: 'admin123', // Will be hashed by model hook
        name: 'System Administrator',
        roleId: superAdminRole.id,
        phone: '+1234567890',
        department: 'Administration',
        employeeId: 'EMP001',
        isActive: true
      }
    )

    // Create doctor user
    await User.updateOrCreate(
      { email: 'dr.sharma@medcare.com' },
      {
        id: uuid(),
        email: 'dr.sharma@medcare.com',
        passwordHash: 'admin123',
        name: 'Dr. Sharma',
        roleId: doctorRole.id,
        phone: '+1234567891',
        department: 'General Medicine',
        employeeId: 'DOC001',
        isActive: true
      }
    )

    // Create nurse user
    await User.updateOrCreate(
      { email: 'nurse@medcare.com' },
      {
        id: uuid(),
        email: 'nurse@medcare.com',
        passwordHash: 'admin123',
        name: 'Nurse Jane Doe',
        roleId: nurseRole.id,
        phone: '+1234567892',
        department: 'General Ward',
        employeeId: 'NUR001',
        isActive: true
      }
    )

    // Create receptionist user
    await User.updateOrCreate(
      { email: 'reception@medcare.com' },
      {
        id: uuid(),
        email: 'reception@medcare.com',
        passwordHash: 'admin123',
        name: 'Mary Johnson',
        roleId: receptionistRole.id,
        phone: '+1234567893',
        department: 'Reception',
        employeeId: 'REC001',
        isActive: true
      }
    )

    // Create additional demo users if roles exist
    if (billingManagerRole) {
      await User.updateOrCreate(
        { email: 'billing@medcare.com' },
        {
          id: uuid(),
          email: 'billing@medcare.com',
          passwordHash: 'admin123',
          name: 'Bill Manager',
          roleId: billingManagerRole.id,
          phone: '+1234567894',
          department: 'Billing',
          employeeId: 'BIL001',
          isActive: true
        }
      )
    }

    if (labTechnicianRole) {
      await User.updateOrCreate(
        { email: 'lab@medcare.com' },
        {
          id: uuid(),
          email: 'lab@medcare.com',
          passwordHash: 'admin123',
          name: 'Lab Technician',
          roleId: labTechnicianRole.id,
          phone: '+1234567895',
          department: 'Laboratory',
          employeeId: 'LAB001',
          isActive: true
        }
      )
    }

    if (pharmacistRole) {
      await User.updateOrCreate(
        { email: 'pharmacy@medcare.com' },
        {
          id: uuid(),
          email: 'pharmacy@medcare.com',
          passwordHash: 'admin123',
          name: 'Pharmacist',
          roleId: pharmacistRole.id,
          phone: '+1234567896',
          department: 'Pharmacy',
          employeeId: 'PHA001',
          isActive: true
        }
      )
    }

    if (medicalStoreManagerRole) {
      await User.updateOrCreate(
        { email: 'store@medcare.com' },
        {
          id: uuid(),
          email: 'store@medcare.com',
          passwordHash: 'admin123',
          name: 'Store Manager',
          roleId: medicalStoreManagerRole.id,
          phone: '+1234567897',
          department: 'Medical Store',
          employeeId: 'STO001',
          isActive: true
        }
      )
    }

    console.log('✅ Default users created successfully')
  }
}