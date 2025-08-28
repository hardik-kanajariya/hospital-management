// Simple test to verify database functionality
import { db } from '@/lib/database';

export async function testDatabaseConnection() {
  try {
    await db.initialize();
    console.log('Database initialized successfully');
    
    // Test basic operations
    const testPatient = {
      patient_id: 'TEST001',
      first_name: 'Test',
      last_name: 'Patient',
      date_of_birth: '1990-01-01',
      gender: 'male' as const,
      phone: '1234567890',
      address: 'Test Address',
      emergency_contact: {
        phone: '0987654321',
        email: 'emergency@test.com',
        address: 'Emergency Address'
      },
      medical_history: [],
      allergies: [],
      chronic_conditions: [],
      vaccination_records: []
    };
    
    const created = await db.create('patients', testPatient);
    console.log('Test patient created:', created);
    
    const patients = await db.getAll('patients');
    console.log('All patients:', patients);
    
    return { success: true, message: 'Database test completed successfully' };
  } catch (error) {
    console.error('Database test failed:', error);
    return { success: false, error: error.message };
  }
}