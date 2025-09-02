import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Role from '#models/role'
import Permission from '#models/permission'

export default class extends BaseSeeder {
    async run() {
        // Create permissions first
        const permissions = await this.createPermissions()

        // Create roles and assign permissions
        await this.createRoles(permissions)
    }

    private async createPermissions() {
        const permissionData = [
            // Dashboard
            { name: 'dashboard_view', displayName: 'View Dashboard', module: 'dashboard' },

            // User Management
            { name: 'users_create', displayName: 'Create Users', module: 'users' },
            { name: 'users_view', displayName: 'View Users', module: 'users' },
            { name: 'users_edit', displayName: 'Edit Users', module: 'users' },
            { name: 'users_delete', displayName: 'Delete Users', module: 'users' },

            // Role Management
            { name: 'roles_create', displayName: 'Create Roles', module: 'roles' },
            { name: 'roles_view', displayName: 'View Roles', module: 'roles' },
            { name: 'roles_edit', displayName: 'Edit Roles', module: 'roles' },
            { name: 'roles_delete', displayName: 'Delete Roles', module: 'roles' },

            // Patient Management
            { name: 'patients_create', displayName: 'Create Patients', module: 'patients' },
            { name: 'patients_view', displayName: 'View Patients', module: 'patients' },
            { name: 'patients_edit', displayName: 'Edit Patients', module: 'patients' },
            { name: 'patients_delete', displayName: 'Delete Patients', module: 'patients' },

            // Appointments
            { name: 'appointments_create', displayName: 'Create Appointments', module: 'appointments' },
            { name: 'appointments_view', displayName: 'View Appointments', module: 'appointments' },
            { name: 'appointments_edit', displayName: 'Edit Appointments', module: 'appointments' },
            { name: 'appointments_delete', displayName: 'Delete Appointments', module: 'appointments' },

            // Doctor Management
            { name: 'doctors_create', displayName: 'Create Doctors', module: 'doctors' },
            { name: 'doctors_view', displayName: 'View Doctors', module: 'doctors' },
            { name: 'doctors_edit', displayName: 'Edit Doctors', module: 'doctors' },
            { name: 'doctors_delete', displayName: 'Delete Doctors', module: 'doctors' },

            // Medical Records
            { name: 'medical_records_create', displayName: 'Create Medical Records', module: 'medical_records' },
            { name: 'medical_records_view', displayName: 'View Medical Records', module: 'medical_records' },
            { name: 'medical_records_edit', displayName: 'Edit Medical Records', module: 'medical_records' },
            { name: 'medical_records_delete', displayName: 'Delete Medical Records', module: 'medical_records' },

            // Billing
            { name: 'billing_create', displayName: 'Create Bills', module: 'billing' },
            { name: 'billing_view', displayName: 'View Bills', module: 'billing' },
            { name: 'billing_edit', displayName: 'Edit Bills', module: 'billing' },
            { name: 'billing_delete', displayName: 'Delete Bills', module: 'billing' },

            // Inventory
            { name: 'inventory_create', displayName: 'Create Inventory', module: 'inventory' },
            { name: 'inventory_view', displayName: 'View Inventory', module: 'inventory' },
            { name: 'inventory_edit', displayName: 'Edit Inventory', module: 'inventory' },
            { name: 'inventory_delete', displayName: 'Delete Inventory', module: 'inventory' },

            // Lab Tests
            { name: 'lab_tests_create', displayName: 'Create Lab Tests', module: 'lab_tests' },
            { name: 'lab_tests_view', displayName: 'View Lab Tests', module: 'lab_tests' },
            { name: 'lab_tests_edit', displayName: 'Edit Lab Tests', module: 'lab_tests' },
            { name: 'lab_tests_delete', displayName: 'Delete Lab Tests', module: 'lab_tests' },

            // Beds
            { name: 'beds_create', displayName: 'Create Beds', module: 'beds' },
            { name: 'beds_view', displayName: 'View Beds', module: 'beds' },
            { name: 'beds_edit', displayName: 'Edit Beds', module: 'beds' },
            { name: 'beds_delete', displayName: 'Delete Beds', module: 'beds' },

            // Prescriptions
            { name: 'prescriptions_create', displayName: 'Create Prescriptions', module: 'prescriptions' },
            { name: 'prescriptions_view', displayName: 'View Prescriptions', module: 'prescriptions' },
            { name: 'prescriptions_edit', displayName: 'Edit Prescriptions', module: 'prescriptions' },
            { name: 'prescriptions_delete', displayName: 'Delete Prescriptions', module: 'prescriptions' },

            // Notifications
            { name: 'notifications_create', displayName: 'Create Notifications', module: 'notifications' },
            { name: 'notifications_view', displayName: 'View Notifications', module: 'notifications' },
            { name: 'notifications_edit', displayName: 'Edit Notifications', module: 'notifications' },
            { name: 'notifications_delete', displayName: 'Delete Notifications', module: 'notifications' },

            // Administration
            { name: 'admin_view', displayName: 'View Admin Panel', module: 'admin' },
            { name: 'user_management_view', displayName: 'View User Management', module: 'user_management' },
            { name: 'masters_view', displayName: 'View Master Data', module: 'masters' },

            // Super Admin Permission (wildcard)
            { name: 'super_admin', displayName: 'Super Admin Access', module: '*' },
        ]

        const permissions: Record<string, any> = {}
        for (const permData of permissionData) {
            const permission = await Permission.firstOrCreate(
                { name: permData.name },
                {
                    id: crypto.randomUUID(),
                    ...permData,
                    isActive: true
                }
            )
            permissions[permData.name] = permission
        }

        return permissions
    }

    private async createRoles(permissions: Record<string, any>) {
        const roleData = [
            {
                name: 'super_admin',
                displayName: 'Super Administrator',
                description: 'Full system access with all permissions',
                accessLevel: 10,
                isSystemRole: true,
                permissions: [
                    { permission: permissions.super_admin, actions: ['create', 'read', 'update', 'delete'] }
                ]
            },
            {
                name: 'doctor',
                displayName: 'Doctor',
                description: 'Medical professional with patient care permissions',
                accessLevel: 8,
                isSystemRole: true,
                permissions: [
                    { permission: permissions.dashboard_view, actions: ['read'] },
                    { permission: permissions.patients_create, actions: ['create', 'read', 'update'] },
                    { permission: permissions.appointments_create, actions: ['create', 'read', 'update'] },
                    { permission: permissions.doctors_view, actions: ['read'] },
                    { permission: permissions.medical_records_create, actions: ['create', 'read', 'update'] },
                    { permission: permissions.prescriptions_create, actions: ['create', 'read', 'update'] },
                    { permission: permissions.lab_tests_create, actions: ['create', 'read'] },
                    { permission: permissions.beds_view, actions: ['read', 'update'] },
                    { permission: permissions.billing_view, actions: ['read'] },
                    { permission: permissions.notifications_create, actions: ['create', 'read'] }
                ]
            },
            {
                name: 'billing_manager',
                displayName: 'Billing Manager',
                description: 'Manages billing and financial operations',
                accessLevel: 6,
                isSystemRole: true,
                permissions: [
                    { permission: permissions.dashboard_view, actions: ['read'] },
                    { permission: permissions.billing_create, actions: ['create', 'read', 'update', 'delete'] },
                    { permission: permissions.patients_view, actions: ['read', 'update'] },
                    { permission: permissions.appointments_view, actions: ['read'] },
                    { permission: permissions.doctors_view, actions: ['read'] },
                    { permission: permissions.notifications_create, actions: ['create', 'read'] }
                ]
            },
            {
                name: 'nurse',
                displayName: 'Nurse',
                description: 'Nursing staff with patient care permissions',
                accessLevel: 5,
                isSystemRole: true,
                permissions: [
                    { permission: permissions.dashboard_view, actions: ['read'] },
                    { permission: permissions.patients_create, actions: ['create', 'read', 'update'] },
                    { permission: permissions.appointments_view, actions: ['read', 'update'] },
                    { permission: permissions.doctors_view, actions: ['read'] },
                    { permission: permissions.medical_records_view, actions: ['read', 'update'] },
                    { permission: permissions.beds_view, actions: ['read', 'update'] },
                    { permission: permissions.notifications_view, actions: ['read'] }
                ]
            },
            {
                name: 'lab_technician',
                displayName: 'Lab Technician',
                description: 'Laboratory operations specialist',
                accessLevel: 4,
                isSystemRole: true,
                permissions: [
                    { permission: permissions.dashboard_view, actions: ['read'] },
                    { permission: permissions.lab_tests_create, actions: ['create', 'read', 'update'] },
                    { permission: permissions.patients_view, actions: ['read'] },
                    { permission: permissions.notifications_create, actions: ['create', 'read'] }
                ]
            },
            {
                name: 'pharmacist',
                displayName: 'Pharmacist',
                description: 'Pharmacy operations specialist',
                accessLevel: 4,
                isSystemRole: true,
                permissions: [
                    { permission: permissions.dashboard_view, actions: ['read'] },
                    { permission: permissions.inventory_create, actions: ['create', 'read', 'update'] },
                    { permission: permissions.prescriptions_view, actions: ['read', 'update'] },
                    { permission: permissions.patients_view, actions: ['read'] },
                    { permission: permissions.notifications_view, actions: ['read'] }
                ]
            },
            {
                name: 'medical_store_manager',
                displayName: 'Medical Store Manager',
                description: 'Manages medical inventory and supplies',
                accessLevel: 5,
                isSystemRole: true,
                permissions: [
                    { permission: permissions.dashboard_view, actions: ['read'] },
                    { permission: permissions.inventory_create, actions: ['create', 'read', 'update', 'delete'] },
                    { permission: permissions.notifications_view, actions: ['read'] }
                ]
            },
            {
                name: 'receptionist',
                displayName: 'Receptionist',
                description: 'Front desk operations',
                accessLevel: 3,
                isSystemRole: true,
                permissions: [
                    { permission: permissions.dashboard_view, actions: ['read'] },
                    { permission: permissions.patients_create, actions: ['create', 'read', 'update'] },
                    { permission: permissions.appointments_create, actions: ['create', 'read', 'update'] },
                    { permission: permissions.doctors_view, actions: ['read'] },
                    { permission: permissions.billing_view, actions: ['read'] },
                    { permission: permissions.notifications_create, actions: ['create', 'read'] }
                ]
            }
        ]

        for (const roleInfo of roleData) {
            const role = await Role.firstOrCreate(
                { name: roleInfo.name },
                {
                    id: crypto.randomUUID(),
                    name: roleInfo.name,
                    displayName: roleInfo.displayName,
                    description: roleInfo.description,
                    accessLevel: roleInfo.accessLevel,
                    isActive: true,
                    isSystemRole: roleInfo.isSystemRole
                }
            )

            // Detach existing permissions first to avoid duplicates
            await role.related('permissions').detach()

            // Attach permissions
            for (const permissionInfo of roleInfo.permissions) {
                await role.related('permissions').attach({
                    [permissionInfo.permission.id]: {
                        id: crypto.randomUUID(),
                        actions: JSON.stringify(permissionInfo.actions)
                    }
                })
            }
        }
    }
}
