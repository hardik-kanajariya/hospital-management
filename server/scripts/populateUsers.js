import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

console.log('🚀 Starting user population script...');

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'medcare_rural',
    charset: 'utf8mb4'
};

console.log('🔧 Database config:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database,
    password: dbConfig.password ? '***' : 'empty'
});

// Demo users data matching LoginForm.tsx
const demoUsers = [
    {
        email: 'admin@medcare.com',
        name: 'System Administrator',
        role: 'super_admin',
        permissions: [{ module: '*', actions: ['create', 'read', 'update', 'delete'] }]
    },
    {
        email: 'dr.sharma@medcare.com',
        name: 'Dr. Rajesh Sharma',
        role: 'doctor',
        permissions: [
            { module: 'dashboard', actions: ['read'] },
            { module: 'patients', actions: ['create', 'read', 'update'] },
            { module: 'appointments', actions: ['create', 'read', 'update'] },
            { module: 'medical_records', actions: ['create', 'read', 'update'] },
            { module: 'doctors', actions: ['read', 'update'] },
            { module: 'prescriptions', actions: ['create', 'read', 'update'] },
            { module: 'lab_tests', actions: ['create', 'read'] },
            { module: 'beds', actions: ['read', 'update'] },
            { module: 'billing', actions: ['read'] },
            { module: 'notifications', actions: ['create', 'read'] }
        ]
    },
    {
        email: 'billing@medcare.com',
        name: 'Priya Billing Manager',
        role: 'billing_manager',
        permissions: [
            { module: 'dashboard', actions: ['read'] },
            { module: 'billing', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'patients', actions: ['read', 'update'] },
            { module: 'appointments', actions: ['read'] },
            { module: 'insurance', actions: ['create', 'read', 'update'] },
            { module: 'reports', actions: ['read'] },
            { module: 'notifications', actions: ['create', 'read'] }
        ]
    },
    {
        email: 'nurse@medcare.com',
        name: 'Sister Meera Nurse',
        role: 'nurse',
        permissions: [
            { module: 'dashboard', actions: ['read'] },
            { module: 'patients', actions: ['create', 'read', 'update'] },
            { module: 'appointments', actions: ['read', 'update'] },
            { module: 'medical_records', actions: ['read', 'update'] },
            { module: 'beds', actions: ['read', 'update'] },
            { module: 'vital_signs', actions: ['create', 'read', 'update'] },
            { module: 'notifications', actions: ['read'] }
        ]
    },
    {
        email: 'lab@medcare.com',
        name: 'Ramesh Lab Technician',
        role: 'lab_technician',
        permissions: [
            { module: 'dashboard', actions: ['read'] },
            { module: 'lab_tests', actions: ['create', 'read', 'update'] },
            { module: 'patients', actions: ['read'] },
            { module: 'lab_results', actions: ['create', 'read', 'update'] },
            { module: 'notifications', actions: ['create', 'read'] }
        ]
    },
    {
        email: 'pharmacy@medcare.com',
        name: 'Sunita Pharmacist',
        role: 'pharmacist',
        permissions: [
            { module: 'dashboard', actions: ['read'] },
            { module: 'inventory', actions: ['create', 'read', 'update'] },
            { module: 'prescriptions', actions: ['read', 'update'] },
            { module: 'patients', actions: ['read'] },
            { module: 'medical_store', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'notifications', actions: ['read'] }
        ]
    },
    {
        email: 'store@medcare.com',
        name: 'Amit Store Manager',
        role: 'medical_store_manager',
        permissions: [
            { module: 'dashboard', actions: ['read'] },
            { module: 'inventory', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'medical_store', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'suppliers', actions: ['create', 'read', 'update'] },
            { module: 'purchases', actions: ['create', 'read', 'update'] },
            { module: 'notifications', actions: ['read'] }
        ]
    },
    {
        email: 'reception@medcare.com',
        name: 'Kavita Receptionist',
        role: 'receptionist',
        permissions: [
            { module: 'dashboard', actions: ['read'] },
            { module: 'patients', actions: ['create', 'read', 'update'] },
            { module: 'appointments', actions: ['create', 'read', 'update'] },
            { module: 'billing', actions: ['read'] },
            { module: 'notifications', actions: ['create', 'read'] }
        ]
    }
];

async function populateUsers() {
    let connection;

    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(dbConfig);

        console.log('Connected to database successfully');

        // Update the users table schema to include all role types
        console.log('Updating users table schema...');
        await connection.execute(`
            ALTER TABLE users MODIFY COLUMN role ENUM(
                'super_admin', 
                'doctor', 
                'billing_manager', 
                'nurse', 
                'lab_technician', 
                'pharmacist', 
                'receptionist', 
                'medical_store_manager'
            ) NOT NULL
        `);

        // Clear existing demo users
        console.log('Clearing existing demo users...');
        await connection.execute("DELETE FROM users WHERE email LIKE '%@medcare.com'");

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('admin123', saltRounds);

        console.log('Inserting demo users...');

        // Insert each user
        for (const user of demoUsers) {
            const userId = uuidv4();

            await connection.execute(`
                INSERT INTO users (id, email, password_hash, name, role, permissions, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, ?, TRUE, NOW())
            `, [
                userId,
                user.email,
                hashedPassword,
                user.name,
                user.role,
                JSON.stringify(user.permissions)
            ]);

            console.log(`✅ Created user: ${user.name} (${user.email}) - Role: ${user.role}`);
        }

        // Verify inserted users
        console.log('\n📋 Verifying inserted users:');
        const [rows] = await connection.execute(`
            SELECT name, email, role, is_active, created_at 
            FROM users 
            WHERE email LIKE '%@medcare.com'
            ORDER BY 
                CASE role
                    WHEN 'super_admin' THEN 1
                    WHEN 'doctor' THEN 2
                    WHEN 'billing_manager' THEN 3
                    WHEN 'nurse' THEN 4
                    WHEN 'lab_technician' THEN 5
                    WHEN 'pharmacist' THEN 6
                    WHEN 'medical_store_manager' THEN 7
                    WHEN 'receptionist' THEN 8
                END
        `);

        console.log('\n👥 Demo Users Created:');
        console.log('========================');
        rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.name}`);
            console.log(`   📧 Email: ${row.email}`);
            console.log(`   👤 Role: ${row.role}`);
            console.log(`   🔓 Password: admin123`);
            console.log(`   ✅ Active: ${row.is_active ? 'Yes' : 'No'}`);
            console.log('');
        });

        console.log('🎉 Database population completed successfully!');
        console.log('🔐 All users have password: admin123');

    } catch (error) {
        console.error('❌ Error populating database:', error.message);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('💡 Check your database credentials in the dbConfig object');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('💡 Database "medcare_rural" does not exist. Please create it first.');
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed');
        }
    }
}

// Run the script - simplified approach for ES modules
console.log('📝 Running populate users function...');
populateUsers().catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
});

export { populateUsers, demoUsers };
