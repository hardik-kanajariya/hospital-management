import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';

dotenv.config();

const seedUsers = async () => {
    console.log('🌱 Seeding users...');

    const users = [
        {
            email: 'admin@medcare.com',
            password_hash: 'admin123',
            name: 'System Administrator',
            role: 'super_admin',
            employee_id: 'EMP001',
            department: 'Administration'
        },
        {
            email: 'doctor@medcare.com',
            password_hash: 'doctor123',
            name: 'Dr. John Smith',
            role: 'doctor',
            employee_id: 'DOC001',
            department: 'General Medicine'
        },
        {
            email: 'nurse@medcare.com',
            password_hash: 'nurse123',
            name: 'Nurse Mary Johnson',
            role: 'nurse',
            employee_id: 'NUR001',
            department: 'General Ward'
        },
        {
            email: 'receptionist@medcare.com',
            password_hash: 'reception123',
            name: 'Sarah Williams',
            role: 'receptionist',
            employee_id: 'REC001',
            department: 'Reception'
        }
    ];

    for (const userData of users) {
        const existingUser = await User.findOne({ where: { email: userData.email } });
        if (!existingUser) {
            await User.create(userData);
            console.log(`✅ Created user: ${userData.email}`);
        } else {
            console.log(`⚠️  User already exists: ${userData.email}`);
        }
    }
};

const seedPatients = async () => {
    console.log('🌱 Seeding patients...');

    const patients = [
        {
            patient_id: 'P240001',
            name: 'John Doe',
            phone: '+1234567890',
            email: 'john.doe@email.com',
            date_of_birth: '1985-06-15',
            gender: 'male',
            address: '123 Main St, Anytown, USA',
            emergency_contact: 'Jane Doe - Wife - +1234567891',
            blood_group: 'O+',
            allergies: ['Penicillin'],
            chronic_conditions: []
        },
        {
            patient_id: 'P240002',
            name: 'Jane Smith',
            phone: '+1234567892',
            email: 'jane.smith@email.com',
            date_of_birth: '1990-03-22',
            gender: 'female',
            address: '456 Oak Ave, Anytown, USA',
            emergency_contact: 'Bob Smith - Husband - +1234567893',
            blood_group: 'A+',
            allergies: [],
            chronic_conditions: ['Diabetes']
        }
    ];

    for (const patientData of patients) {
        const existingPatient = await Patient.findOne({ where: { patient_id: patientData.patient_id } });
        if (!existingPatient) {
            await Patient.create(patientData);
            console.log(`✅ Created patient: ${patientData.name}`);
        } else {
            console.log(`⚠️  Patient already exists: ${patientData.name}`);
        }
    }
};

const runSeed = async () => {
    try {
        console.log('🚀 Starting database seeding...');

        await connectDatabase();
        console.log('✅ Database connected');

        await seedUsers();
        await seedPatients();

        console.log('🎉 Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

runSeed();
