import sequelize from '../config/database.js';
import {
    User, Patient, Doctor, Appointment, MedicalRecord,
    Prescription, LabTest, Bill, Bed, Inventory, Notification
} from '../models/index.js';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        // Create Users (using individual creates to ensure hooks run)
        console.log('Creating users...');
        const userData = [
            {
                email: 'admin@medcare.com',
                password_hash: 'admin123',
                name: 'System Administrator',
                role: 'super_admin',
                phone: '+1234567890',
                department: 'Administration',
                employee_id: 'EMP001'
            },
            {
                email: 'dr.sharma@medcare.com',
                password_hash: 'admin123',
                name: 'Dr. Arjun Sharma',
                role: 'doctor',
                phone: '+1234567891',
                department: 'Cardiology',
                employee_id: 'DOC001'
            },
            {
                email: 'billing@medcare.com',
                password_hash: 'admin123',
                name: 'Emma Johnson',
                role: 'billing_manager',
                phone: '+1234567892',
                department: 'Finance',
                employee_id: 'BIL001'
            },
            {
                email: 'nurse@medcare.com',
                password_hash: 'admin123',
                name: 'Mary Wilson',
                role: 'nurse',
                phone: '+1234567893',
                department: 'General Ward',
                employee_id: 'NUR001'
            },
            {
                email: 'lab@medcare.com',
                password_hash: 'admin123',
                name: 'Robert Chen',
                role: 'lab_technician',
                phone: '+1234567894',
                department: 'Laboratory',
                employee_id: 'LAB001'
            },
            {
                email: 'pharmacy@medcare.com',
                password_hash: 'admin123',
                name: 'Sarah Davis',
                role: 'pharmacist',
                phone: '+1234567895',
                department: 'Pharmacy',
                employee_id: 'PHA001'
            },
            {
                email: 'store@medcare.com',
                password_hash: 'admin123',
                name: 'Michael Brown',
                role: 'medical_store_manager',
                phone: '+1234567896',
                department: 'Medical Store',
                employee_id: 'STO001'
            },
            {
                email: 'reception@medcare.com',
                password_hash: 'admin123',
                name: 'Lisa Thompson',
                role: 'receptionist',
                phone: '+1234567897',
                department: 'Reception',
                employee_id: 'REC001'
            }
        ];

        const users = [];
        for (const data of userData) {
            const user = await User.create(data);
            // Update to trigger permission setting
            await user.save();
            users.push(user);
        }

        // Create Doctors
        console.log('Creating doctor profiles...');
        const doctors = await Doctor.bulkCreate([
            {
                user_id: users[1].id, // Dr. Arjun Sharma
                medical_license: 'MD12345',
                specialization: 'Cardiology',
                qualification: 'MBBS, MD Cardiology',
                experience_years: 15,
                consultation_fee: 200.00,
                working_hours: {
                    monday: { start: '09:00', end: '17:00' },
                    tuesday: { start: '09:00', end: '17:00' },
                    wednesday: { start: '09:00', end: '17:00' },
                    thursday: { start: '09:00', end: '17:00' },
                    friday: { start: '09:00', end: '17:00' }
                },
                available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                room_number: 'C-101',
                bio: 'Experienced cardiologist specializing in heart disease treatment and prevention.'
            }
        ]);

        // Create Patients
        console.log('Creating patients...');
        const patients = await Patient.bulkCreate([
            {
                patient_id: 'PAT001',
                name: 'Alice Cooper',
                phone: '+1555000001',
                email: 'alice.cooper@email.com',
                date_of_birth: '1990-05-15',
                gender: 'female',
                address: '123 Main St, Anytown, USA 12345',
                emergency_contact: 'John Cooper - Husband - +1555000002',
                blood_group: 'A+',
                allergies: ['Penicillin', 'Peanuts'],
                chronic_conditions: [],
                vaccination_records: [
                    { vaccine: 'COVID-19', date: '2023-01-15', booster: true }
                ],
                insurance_info: {
                    provider: 'HealthCare Plus',
                    policy_number: 'HC123456789',
                    group_number: 'GRP001'
                },
                created_by: users[7].id // Receptionist
            },
            {
                patient_id: 'PAT002',
                name: 'Bob Mitchell',
                phone: '+1555000003',
                email: 'bob.mitchell@email.com',
                date_of_birth: '1985-08-22',
                gender: 'male',
                address: '456 Oak Ave, Somewhere, USA 54321',
                emergency_contact: 'Jane Mitchell - Wife - +1555000004',
                blood_group: 'O-',
                allergies: ['Shellfish'],
                chronic_conditions: ['Hypertension'],
                vaccination_records: [
                    { vaccine: 'Flu', date: '2023-10-01' },
                    { vaccine: 'COVID-19', date: '2023-01-20', booster: true }
                ],
                insurance_info: {
                    provider: 'MediCare Insurance',
                    policy_number: 'MC987654321',
                    group_number: 'GRP002'
                },
                created_by: users[7].id
            }
        ]);

        // Create Appointments
        console.log('Creating appointments...');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);

        const appointments = await Appointment.bulkCreate([
            {
                appointment_id: 'APP001',
                patient_id: patients[0].id,
                doctor_id: doctors[0].id,
                appointment_date: tomorrow,
                duration: 30,
                type: 'consultation',
                status: 'scheduled',
                priority: 'medium',
                symptoms: 'Chest pain and shortness of breath',
                consultation_fee: 200.00,
                created_by: users[7].id
            },
            {
                appointment_id: 'APP002',
                patient_id: patients[1].id,
                doctor_id: doctors[0].id,
                appointment_date: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
                duration: 45,
                type: 'routine_checkup',
                status: 'scheduled',
                priority: 'low',
                symptoms: 'Annual health checkup',
                consultation_fee: 200.00,
                created_by: users[7].id
            }
        ]);

        // Create Inventory Items
        console.log('Creating inventory items...');
        await Inventory.bulkCreate([
            {
                item_code: 'MED001',
                name: 'Paracetamol 500mg',
                description: 'Pain relief and fever reducer',
                category: 'medication',
                unit: 'tablets',
                current_stock: 1000,
                minimum_stock: 100,
                maximum_stock: 2000,
                unit_cost: 0.50,
                selling_price: 1.00,
                supplier: 'PharmaCorp',
                manufacturer: 'GenericMeds',
                batch_number: 'PAR2024001',
                expiry_date: new Date('2025-12-31'),
                location: 'Pharmacy-A1',
                created_by: users[0].id
            },
            {
                item_code: 'MED002',
                name: 'Amoxicillin 250mg',
                description: 'Antibiotic for bacterial infections',
                category: 'medication',
                unit: 'capsules',
                current_stock: 500,
                minimum_stock: 50,
                maximum_stock: 1000,
                unit_cost: 2.00,
                selling_price: 4.00,
                supplier: 'MediSupply',
                manufacturer: 'BioPharm',
                batch_number: 'AMX2024001',
                expiry_date: new Date('2025-06-30'),
                location: 'Pharmacy-B2',
                created_by: users[0].id
            },
            {
                item_code: 'EQP001',
                name: 'Digital Thermometer',
                description: 'Non-contact infrared thermometer',
                category: 'medical_equipment',
                unit: 'pieces',
                current_stock: 25,
                minimum_stock: 5,
                maximum_stock: 50,
                unit_cost: 45.00,
                selling_price: 75.00,
                supplier: 'MedTech Solutions',
                manufacturer: 'ThermoMed',
                location: 'Equipment-Room-1',
                created_by: users[0].id
            }
        ]);

        // Create Beds
        console.log('Creating beds...');
        await Bed.bulkCreate([
            {
                bed_number: 'G-101',
                room_number: '101',
                ward: 'General Ward',
                bed_type: 'general',
                status: 'available',
                daily_rate: 100.00,
                features: ['TV', 'WiFi', 'Private bathroom'],
                assigned_nurse: users[3].id
            },
            {
                bed_number: 'G-102',
                room_number: '102',
                ward: 'General Ward',
                bed_type: 'general',
                status: 'available',
                daily_rate: 100.00,
                features: ['TV', 'WiFi'],
                assigned_nurse: users[3].id
            },
            {
                bed_number: 'ICU-001',
                room_number: 'ICU-1',
                ward: 'ICU',
                bed_type: 'icu',
                status: 'available',
                daily_rate: 500.00,
                features: ['Ventilator support', 'Cardiac monitoring', 'Emergency call'],
                assigned_nurse: users[3].id
            }
        ]);

        // Create Notifications
        console.log('Creating notifications...');
        await Notification.bulkCreate([
            {
                user_id: users[1].id, // Dr. Sharma
                title: 'New Appointment Scheduled',
                message: 'You have a new appointment with Alice Cooper tomorrow at 10:00 AM',
                type: 'appointment',
                priority: 'medium',
                data: { appointment_id: appointments[0].id },
                created_by: users[7].id
            },
            {
                user_id: users[0].id, // Admin
                title: 'Low Stock Alert',
                message: 'Amoxicillin 250mg stock is running low (50 units remaining)',
                type: 'warning',
                priority: 'high',
                data: { item_code: 'MED002', current_stock: 50 }
            }
        ]);

        console.log('✅ Database seeding completed successfully!');
        console.log('\n📋 Created:');
        console.log(`   • ${users.length} users`);
        console.log(`   • ${doctors.length} doctors`);
        console.log(`   • ${patients.length} patients`);
        console.log(`   • ${appointments.length} appointments`);
        console.log('   • 3 inventory items');
        console.log('   • 3 beds');
        console.log('   • 2 notifications');

        console.log('\n🔑 Demo Login Credentials (All use password: admin123):');
        console.log('   Super Admin: admin@medcare.com');
        console.log('   Doctor: dr.sharma@medcare.com');
        console.log('   Billing Manager: billing@medcare.com');
        console.log('   Nurse: nurse@medcare.com');
        console.log('   Lab Technician: lab@medcare.com');
        console.log('   Pharmacist: pharmacy@medcare.com');
        console.log('   Store Manager: store@medcare.com');
        console.log('   Receptionist: reception@medcare.com');

    } catch (error) {
        console.error('❌ Database seeding failed:', error);
        throw error;
    }
};

// Run seeding
seedDatabase()
    .then(() => {
        console.log('🎉 Seeding process completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Seeding process failed:', error);
        process.exit(1);
    });
