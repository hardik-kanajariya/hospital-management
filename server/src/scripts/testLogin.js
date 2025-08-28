import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';

async function testLogin() {
    try {
        await connectDatabase();
        console.log('Database connected');

        // Check if users exist
        const users = await User.findAll({ limit: 5 });
        console.log(`Users found: ${users.length}`);

        for (const user of users) {
            console.log(`User: ${user.email}, Active: ${user.is_active}, Role: ${user.role}`);
        }

        // Test admin user specifically
        const admin = await User.findOne({ where: { email: 'admin@medcare.com' } });
        if (admin) {
            console.log('\nAdmin user found:');
            console.log('Email:', admin.email);
            console.log('Is active:', admin.is_active);
            console.log('Password hash exists:', !!admin.password_hash);
            console.log('Password hash length:', admin.password_hash.length);

            // Test password comparison
            const testPassword = 'admin123';
            const isMatch = await admin.comparePassword(testPassword);
            console.log(`Password "${testPassword}" matches:`, isMatch);

        } else {
            console.log('Admin user not found');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testLogin();
