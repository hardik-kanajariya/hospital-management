import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    async up() {
        // Add super_dupar_admin role to the system
        this.schema.raw(`
            INSERT INTO roles (id, name, display_name, description, access_level, is_active, is_system_role, organization_id, created_at, updated_at)
            VALUES (
                UUID(),
                'super_dupar_admin',
                'Super Dupar Administrator',
                'Highest level administrator with access to manage all super admins across organizations',
                1000,
                true,
                true,
                NULL,
                NOW(),
                NOW()
            )
            ON DUPLICATE KEY UPDATE
                display_name = 'Super Dupar Administrator',
                description = 'Highest level administrator with access to manage all super admins across organizations',
                access_level = 1000
        `)

        // Create the top-level system management permission
        this.schema.raw(`
            INSERT INTO permissions (id, name, display_name, module, description, created_at, updated_at)
            VALUES (
                UUID(),
                'super_dupar.*',
                'Super Dupar Administrator Access',
                'super_dupar',
                'Complete system administration across all organizations and super admins',
                NOW(),
                NOW()
            )
            ON DUPLICATE KEY UPDATE
                display_name = 'Super Dupar Administrator Access',
                description = 'Complete system administration across all organizations and super admins'
        `)
    }

    async down() {
        // Remove the super_dupar_admin role and permission
        this.schema.raw(`DELETE FROM roles WHERE name = 'super_dupar_admin'`)
        this.schema.raw(`DELETE FROM permissions WHERE name = 'super_dupar.*'`)
    }
}
