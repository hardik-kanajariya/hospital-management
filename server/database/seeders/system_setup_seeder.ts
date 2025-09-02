import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Organization from '#models/organization'
import Role from '#models/role'
import Permission from '#models/permission'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import env from '#start/env'
import { v4 as uuid } from 'uuid'

export default class extends BaseSeeder {
    async run() {
        console.log('🚀 Starting system setup seeder...')

        // Create a default organization
        const defaultOrg = await Organization.firstOrCreate(
            { name: 'Default Hospital' },
            {
                name: 'Default Hospital',
                type: 'hospital',
                status: 'active',
                timezone: 'UTC',
                currency: 'USD',
                language: 'en'
            }
        )

        console.log(`✅ Default organization: ${defaultOrg.name}`)

        // Update existing roles to have organization_id = null for global roles
        await Role.query()
            .whereIn('name', ['super_admin', 'org_admin'])
            .update({ organizationId: null })

        // Update organization-specific roles to belong to default organization
        await Role.query()
            .whereIn('name', ['doctor', 'nurse', 'receptionist', 'lab_technician', 'pharmacist', 'billing_manager', 'medical_store_manager'])
            .update({ organizationId: defaultOrg.id })

        // Create any missing global system roles
        const systemRoles = [
            {
                name: 'super_admin',
                displayName: 'Super Administrator',
                description: 'Full system access across all organizations',
                accessLevel: 100,
                isSystemRole: true,
                organizationId: null
            },
            {
                name: 'org_admin',
                displayName: 'Organization Administrator',
                description: 'Full access within organization',
                accessLevel: 90,
                isSystemRole: true,
                organizationId: null
            }
        ]

        for (const roleData of systemRoles) {
            await Role.firstOrCreate(
                { name: roleData.name },
                roleData
            )
        }

        console.log('✅ System roles created/updated')

        // Create comprehensive permissions
        const permissions = [
            // System permissions
            { name: 'system.*', displayName: 'System Administrator', module: 'system', description: 'Full system access' },
            { name: 'organizations.*', displayName: 'Manage Organizations', module: 'organizations', description: 'Manage organizations' },

            // User management
            { name: 'users.read', displayName: 'View Users', module: 'users', description: 'View user information' },
            { name: 'users.create', displayName: 'Create Users', module: 'users', description: 'Create new users' },
            { name: 'users.update', displayName: 'Update Users', module: 'users', description: 'Update user information' },
            { name: 'users.delete', displayName: 'Delete Users', module: 'users', description: 'Delete users' },
            { name: 'users.manage_roles', displayName: 'Manage User Roles', module: 'users', description: 'Assign/remove user roles' },

            // Role management
            { name: 'roles.read', displayName: 'View Roles', module: 'roles', description: 'View role information' },
            { name: 'roles.create', displayName: 'Create Roles', module: 'roles', description: 'Create new roles' },
            { name: 'roles.update', displayName: 'Update Roles', module: 'roles', description: 'Update role information' },
            { name: 'roles.delete', displayName: 'Delete Roles', module: 'roles', description: 'Delete roles' },

            // Patient management
            { name: 'patients.read', displayName: 'View Patients', module: 'patients', description: 'View patient information' },
            { name: 'patients.create', displayName: 'Create Patients', module: 'patients', description: 'Register new patients' },
            { name: 'patients.update', displayName: 'Update Patients', module: 'patients', description: 'Update patient information' },
            { name: 'patients.delete', displayName: 'Delete Patients', module: 'patients', description: 'Delete patient records' },

            // Appointment management
            { name: 'appointments.read', displayName: 'View Appointments', module: 'appointments', description: 'View appointment information' },
            { name: 'appointments.create', displayName: 'Create Appointments', module: 'appointments', description: 'Schedule new appointments' },
            { name: 'appointments.update', displayName: 'Update Appointments', module: 'appointments', description: 'Modify appointments' },
            { name: 'appointments.delete', displayName: 'Cancel Appointments', module: 'appointments', description: 'Cancel appointments' },

            // Medical records
            { name: 'medical_records.read', displayName: 'View Medical Records', module: 'medical_records', description: 'View patient medical records' },
            { name: 'medical_records.create', displayName: 'Create Medical Records', module: 'medical_records', description: 'Create medical records' },
            { name: 'medical_records.update', displayName: 'Update Medical Records', module: 'medical_records', description: 'Update medical records' },
            { name: 'medical_records.delete', displayName: 'Delete Medical Records', module: 'medical_records', description: 'Delete medical records' },

            // Laboratory
            { name: 'lab_tests.read', displayName: 'View Lab Tests', module: 'lab_tests', description: 'View laboratory test results' },
            { name: 'lab_tests.create', displayName: 'Create Lab Tests', module: 'lab_tests', description: 'Order laboratory tests' },
            { name: 'lab_tests.update', displayName: 'Update Lab Tests', module: 'lab_tests', description: 'Update test results' },
            { name: 'lab_tests.delete', displayName: 'Delete Lab Tests', module: 'lab_tests', description: 'Delete lab tests' },

            // Billing
            { name: 'billing.read', displayName: 'View Bills', module: 'billing', description: 'View billing information' },
            { name: 'billing.create', displayName: 'Create Bills', module: 'billing', description: 'Generate bills' },
            { name: 'billing.update', displayName: 'Update Bills', module: 'billing', description: 'Modify billing information' },
            { name: 'billing.delete', displayName: 'Delete Bills', module: 'billing', description: 'Delete bills' },

            // Inventory
            { name: 'inventory.read', displayName: 'View Inventory', module: 'inventory', description: 'View inventory items' },
            { name: 'inventory.create', displayName: 'Add Inventory', module: 'inventory', description: 'Add inventory items' },
            { name: 'inventory.update', displayName: 'Update Inventory', module: 'inventory', description: 'Update inventory' },
            { name: 'inventory.delete', displayName: 'Delete Inventory', module: 'inventory', description: 'Delete inventory items' },

            // Reports
            { name: 'reports.read', displayName: 'View Reports', module: 'reports', description: 'View system reports' },
            { name: 'reports.export', displayName: 'Export Reports', module: 'reports', description: 'Export report data' }
        ]

        for (const permissionData of permissions) {
            await Permission.firstOrCreate(
                { name: permissionData.name },
                permissionData
            )
        }

        console.log('✅ Permissions created/updated')

        // Get all the roles we need
        const superAdminRole = await Role.findBy('name', 'super_admin')
        const orgAdminRole = await Role.findBy('name', 'org_admin')
        const doctorRole = await Role.findBy('name', 'doctor')
        const nurseRole = await Role.findBy('name', 'nurse')
        const receptionistRole = await Role.findBy('name', 'receptionist')
        const billingManagerRole = await Role.findBy('name', 'billing_manager')
        const labTechnicianRole = await Role.findBy('name', 'lab_technician')
        const pharmacistRole = await Role.findBy('name', 'pharmacist')
        const medicalStoreManagerRole = await Role.findBy('name', 'medical_store_manager')

        // Assign permissions to roles
        if (superAdminRole) {
            // Super admin gets system access
            const systemPermission = await Permission.query().where('name', 'system.*').first()
            if (systemPermission) {
                // Check if permission already assigned
                const existingRelation = await superAdminRole.related('permissions').query()
                    .where('permission_id', systemPermission.id).first()

                if (!existingRelation) {
                    await superAdminRole.related('permissions').attach({
                        [systemPermission.id]: { actions: JSON.stringify(['*']) }
                    })
                }
            }
        }

        if (orgAdminRole) {
            // Org admin gets all permissions except system
            const allPermissions = await Permission.query().whereNot('module', 'system')
            for (const permission of allPermissions) {
                // Check if permission already assigned
                const existingRelation = await orgAdminRole.related('permissions').query()
                    .where('permission_id', permission.id).first()

                if (!existingRelation) {
                    await orgAdminRole.related('permissions').attach({
                        [permission.id]: { actions: JSON.stringify(['read', 'create', 'update', 'delete']) }
                    })
                }
            }
        }

        if (doctorRole) {
            // Doctor gets patient care permissions
            const doctorPermissions = await Permission.query().whereIn('module', [
                'patients', 'appointments', 'medical_records', 'lab_tests'
            ])
            for (const permission of doctorPermissions) {
                // Check if permission already assigned
                const existingRelation = await doctorRole.related('permissions').query()
                    .where('permission_id', permission.id).first()

                if (!existingRelation) {
                    await doctorRole.related('permissions').attach({
                        [permission.id]: { actions: JSON.stringify(['read', 'create', 'update']) }
                    })
                }
            }
        }

        console.log('✅ Role permissions assigned')

        // Create system users (production-ready, non-demo)
        await User.firstOrCreate(
            { email: 'admin@hospital.com' },
            {
                id: uuid(),
                email: 'admin@hospital.com',
                passwordHash: await hash.make('password123'),
                name: 'Super Administrator',
                roleId: superAdminRole?.id,
                organizationId: null,
                isActive: true,
                isForDemoPurpose: false,
                phone: '+1234567890',
                department: 'Administration',
                employeeId: 'SYS001'
            }
        )

        console.log('✅ System admin user created')

        // Create demo users only if environment allows
        const shouldCreateDemoUsers = env.get('NODE_ENV') === 'development' ||
            env.get('SHOW_DEMO_ACCOUNTS', 'false') === 'true'

        if (shouldCreateDemoUsers && superAdminRole && doctorRole && nurseRole && receptionistRole) {
            console.log('🎭 Creating demo users...')

            const demoUsers = [
                {
                    email: 'admin@medcare.com',
                    name: 'Demo Administrator',
                    roleId: superAdminRole.id,
                    phone: '+1234567890',
                    department: 'Administration',
                    employeeId: 'DEMO001'
                },
                {
                    email: 'dr.sharma@medcare.com',
                    name: 'Dr. Rajesh Sharma',
                    roleId: doctorRole.id,
                    phone: '+1234567891',
                    department: 'General Medicine',
                    employeeId: 'DEMO002'
                },
                {
                    email: 'nurse@medcare.com',
                    name: 'Nurse Priya Patel',
                    roleId: nurseRole.id,
                    phone: '+1234567892',
                    department: 'General Ward',
                    employeeId: 'DEMO003'
                },
                {
                    email: 'reception@medcare.com',
                    name: 'Mary Johnson',
                    roleId: receptionistRole.id,
                    phone: '+1234567893',
                    department: 'Reception',
                    employeeId: 'DEMO004'
                }
            ]

            // Add additional demo users if roles exist
            if (billingManagerRole) {
                demoUsers.push({
                    email: 'billing@medcare.com',
                    name: 'Amit Kumar (Billing)',
                    roleId: billingManagerRole.id,
                    phone: '+1234567894',
                    department: 'Billing',
                    employeeId: 'DEMO005'
                })
            }

            if (labTechnicianRole) {
                demoUsers.push({
                    email: 'lab@medcare.com',
                    name: 'Rahul Singh (Lab Tech)',
                    roleId: labTechnicianRole.id,
                    phone: '+1234567895',
                    department: 'Laboratory',
                    employeeId: 'DEMO006'
                })
            }

            if (pharmacistRole) {
                demoUsers.push({
                    email: 'pharmacy@medcare.com',
                    name: 'Sunita Sharma (Pharmacist)',
                    roleId: pharmacistRole.id,
                    phone: '+1234567896',
                    department: 'Pharmacy',
                    employeeId: 'DEMO007'
                })
            }

            if (medicalStoreManagerRole) {
                demoUsers.push({
                    email: 'store@medcare.com',
                    name: 'Vikram Yadav (Store Manager)',
                    roleId: medicalStoreManagerRole.id,
                    phone: '+1234567897',
                    department: 'Medical Store',
                    employeeId: 'DEMO008'
                })
            }

            // Create demo users
            for (const userData of demoUsers) {
                await User.firstOrCreate(
                    { email: userData.email },
                    {
                        id: uuid(),
                        email: userData.email,
                        passwordHash: await hash.make('admin123'),
                        name: userData.name,
                        roleId: userData.roleId,
                        organizationId: defaultOrg.id,
                        isActive: true,
                        isForDemoPurpose: true,
                        phone: userData.phone,
                        department: userData.department,
                        employeeId: userData.employeeId
                    }
                )
            }

            console.log(`✅ Created ${demoUsers.length} demo users`)
            console.log('🔑 Demo password for all accounts: admin123')
        } else {
            console.log('⏭️  Skipping demo users creation (disabled in environment)')
        }

        console.log('\n🎉 System setup completed successfully!')
        console.log(`📧 System Admin: admin@hospital.com / password123`)
        console.log(`🏥 Default Organization: ${defaultOrg.name}`)

        if (shouldCreateDemoUsers) {
            console.log('🎭 Demo accounts are available with password: admin123')
        }
    }
}
