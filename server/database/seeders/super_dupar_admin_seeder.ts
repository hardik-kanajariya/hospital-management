import { BaseSeeder } from '@adonisjs/lucid/seeders'
import SuperDuparAdmin from '#models/super_dupar_admin'
import Role from '#models/role'
import Permission from '#models/permission'
import env from '#start/env'

export default class extends BaseSeeder {
    async run() {
        console.log('🚀 Starting Super Dupar Admin seeder...')

        // Create the super dupar admin role if it doesn't exist
        const superDuparAdminRole = await Role.updateOrCreate(
            { name: 'super_dupar_admin' },
            {
                name: 'super_dupar_admin',
                displayName: 'Super Dupar Administrator',
                description: 'Highest level administrator with access to manage all super admins across organizations',
                accessLevel: 1000,
                isActive: true,
                isSystemRole: true,
                organizationId: null
            }
        )

        // Create the super dupar admin permission if it doesn't exist
        const superDuparPermission = await Permission.updateOrCreate(
            { name: 'super_dupar.*' },
            {
                name: 'super_dupar.*',
                displayName: 'Super Dupar Administrator Access',
                module: 'super_dupar',
                description: 'Complete system administration across all organizations and super admins'
            }
        )

        // Assign permission to role
        const existingRelation = await superDuparAdminRole.related('permissions').query()
            .where('permission_id', superDuparPermission.id).first()

        if (!existingRelation) {
            await superDuparAdminRole.related('permissions').attach({
                [superDuparPermission.id]: { actions: JSON.stringify(['*']) }
            })
        }

        console.log('✅ Super Dupar Admin role and permissions created')

        // Create the default Super Dupar Admin user
        const defaultSuperDuparAdmin = await SuperDuparAdmin.updateOrCreate(
            { email: env.get('SUPER_DUPAR_ADMIN_EMAIL', 'superdupar@hospital.com') },
            {
                email: env.get('SUPER_DUPAR_ADMIN_EMAIL', 'superdupar@hospital.com'),
                passwordHash: env.get('SUPER_DUPAR_ADMIN_PASSWORD', 'superdupar123'),
                name: env.get('SUPER_DUPAR_ADMIN_NAME', 'Super Dupar Administrator'),
                phone: env.get('SUPER_DUPAR_ADMIN_PHONE', '+1234567890'),
                isActive: true,
                settings: {
                    theme: 'light',
                    notifications: true,
                    language: 'en'
                },
                permissions: ['super_dupar.*']
            }
        )

        console.log('✅ Default Super Dupar Admin user created')
        console.log(`📧 Super Dupar Admin Email: ${defaultSuperDuparAdmin.email}`)
        console.log(`🔑 Super Dupar Admin Password: ${env.get('SUPER_DUPAR_ADMIN_PASSWORD', 'superdupar123')}`)

        // Log initial activity
        await defaultSuperDuparAdmin.logActivity('system_initialization', {
            details: {
                message: 'Super Dupar Admin account initialized',
                timestamp: new Date().toISOString()
            }
        })

        console.log('🎉 Super Dupar Admin seeder completed successfully!')
    }
}
