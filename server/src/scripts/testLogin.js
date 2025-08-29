import { User } from '../models/index.js';
import bcrypt from 'bcrypt';

async function testLogin() {
    try {
        console.log('🔍 Testing login functionality...\n');

        // Test credentials
        const testCredentials = [
            { email: 'admin@medcare.com', password: 'admin123', role: 'super_admin' },
            { email: 'dr.sharma@medcare.com', password: 'admin123', role: 'doctor' },
            { email: 'nurse@medcare.com', password: 'admin123', role: 'nurse' },
            { email: 'billing@medcare.com', password: 'admin123', role: 'billing_manager' },
            { email: 'lab@medcare.com', password: 'admin123', role: 'lab_technician' },
            { email: 'pharmacy@medcare.com', password: 'admin123', role: 'pharmacist' },
            { email: 'reception@medcare.com', password: 'admin123', role: 'receptionist' }
        ]; for (const creds of testCredentials) {
            console.log(`Testing ${creds.role}: ${creds.email}`);

            // Find user
            const user = await User.findOne({ where: { email: creds.email } });

            if (!user) {
                console.log(`❌ User not found: ${creds.email}\n`);
                continue;
            }

            console.log(`📧 User found: ${user.name}`);
            console.log(`🔑 Stored hash: ${user.password_hash}`);

            // Test password
            const isValid = await bcrypt.compare(creds.password, user.password_hash);
            console.log(`🔐 Password valid: ${isValid}`);

            if (isValid) {
                console.log(`✅ Login successful for ${creds.role}!\n`);
            } else {
                console.log(`❌ Login failed for ${creds.role}!\n`);
            }
        }

        console.log('🎉 Authentication test completed!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testLogin();
