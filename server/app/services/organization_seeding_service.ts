import MasterData from '#models/master_data'
import Permission from '#models/permission'
import Role from '#models/role'
import RoleField from '#models/role_field'
import SystemSetting from '#models/system_setting'
import Database from '@adonisjs/lucid/services/db'

export default class OrganizationSeedingService {
    /**
     * Seed all system data for a new organization
     */
    public static async seedOrganizationData(organizationId: string) {
        console.log(`🌱 Starting organization seeding for organization: ${organizationId}`)

        const trx = await Database.transaction()

        try {
            // Seed master data
            await this.seedMasterData(organizationId, trx)
            
            // Seed permissions
            await this.seedPermissions(organizationId, trx)
            
            // Seed roles
            await this.seedRoles(organizationId, trx)
            
            // Seed role fields
            await this.seedRoleFields(organizationId, trx)
            
            // Seed system settings
            await this.seedSystemSettings(organizationId, trx)

            await trx.commit()
            console.log(`✅ Organization seeding completed for organization: ${organizationId}`)
            
        } catch (error) {
            await trx.rollback()
            console.error(`❌ Organization seeding failed for organization: ${organizationId}`, error)
            throw error
        }
    }

    /**
     * Seed master data for organization by copying system data
     */
    private static async seedMasterData(organizationId: string, trx: any) {
        console.log('📊 Seeding master data...')

        // Get all system master data (organization_id is null)
        const systemMasterData = await MasterData.query({ client: trx })
            .whereNull('organization_id')

        if (systemMasterData.length === 0) {
            console.log('⚠️ No system master data found to copy')
            return
        }

        // Copy system data for this organization
        const organizationMasterData = systemMasterData.map(item => ({
            category: item.category,
            name: item.name,
            description: item.description,
            value: item.value,
            display_order: item.displayOrder,
            is_system: item.isSystem,
            is_active: item.isActive,
            metadata: JSON.stringify(item.metadata),
            organization_id: organizationId,
            created_at: new Date(),
            updated_at: new Date()
        }))

        await Database.table('master_data').useTransaction(trx).insert(organizationMasterData)
        console.log(`✅ Copied ${organizationMasterData.length} master data records`)
    }

    /**
     * Seed permissions for organization by copying system permissions
     */
    private static async seedPermissions(organizationId: string, trx: any) {
        console.log('🔐 Seeding permissions...')

        // Get all system permissions (organization_id is null)
        const systemPermissions = await Permission.query({ client: trx })
            .whereNull('organization_id')

        if (systemPermissions.length === 0) {
            console.log('⚠️ No system permissions found to copy')
            return
        }

        // Copy system permissions for this organization
        const organizationPermissions = systemPermissions.map(permission => ({
            id: permission.id + '_' + organizationId.replace(/-/g, ''), // Make unique ID
            name: permission.name,
            display_name: permission.displayName,
            module: permission.module,
            description: permission.description,
            is_active: permission.isActive,
            organization_id: organizationId,
            created_at: new Date(),
            updated_at: new Date()
        }))

        await Database.table('permissions').useTransaction(trx).insert(organizationPermissions)
        console.log(`✅ Copied ${organizationPermissions.length} permission records`)
    }

    /**
     * Seed roles for organization by copying system roles
     */
    private static async seedRoles(organizationId: string, trx: any) {
        console.log('👥 Seeding roles...')

        // Get all system roles (organization_id is null, excluding super_dupar_admin)
        const systemRoles = await Role.query({ client: trx })
            .whereNull('organization_id')
            .where('name', '!=', 'super_dupar_admin')

        if (systemRoles.length === 0) {
            console.log('⚠️ No system roles found to copy')
            return
        }

        // Copy system roles for this organization
        const organizationRoles = systemRoles.map(role => ({
            id: role.id + '_' + organizationId.replace(/-/g, ''), // Make unique ID
            name: role.name,
            display_name: role.displayName,
            description: role.description,
            access_level: role.accessLevel,
            is_active: role.isActive,
            is_system_role: role.isSystemRole,
            organization_id: organizationId,
            created_at: new Date(),
            updated_at: new Date()
        }))

        await Database.table('roles').useTransaction(trx).insert(organizationRoles)
        console.log(`✅ Copied ${organizationRoles.length} role records`)

        // Copy role permissions
        await this.seedRolePermissions(organizationId, trx)
    }

    /**
     * Seed role permissions relationships for organization
     */
    private static async seedRolePermissions(organizationId: string, trx: any) {
        console.log('🔗 Seeding role permissions...')

        // Get system role permissions for system roles
        const systemRolePermissions = await Database.from('role_permissions')
            .useTransaction(trx)
            .join('roles', 'role_permissions.role_id', 'roles.id')
            .join('permissions', 'role_permissions.permission_id', 'permissions.id')
            .whereNull('roles.organization_id')
            .whereNull('permissions.organization_id')
            .where('roles.name', '!=', 'super_dupar_admin')
            .select([
                'role_permissions.role_id',
                'role_permissions.permission_id',
                'role_permissions.actions',
                'roles.name as role_name',
                'permissions.name as permission_name'
            ])

        if (systemRolePermissions.length === 0) {
            console.log('⚠️ No system role permissions found to copy')
            return
        }

        // Create organization-specific role permission relationships
        const organizationRolePermissions = systemRolePermissions.map(rp => ({
            role_id: rp.role_id + '_' + organizationId.replace(/-/g, ''),
            permission_id: rp.permission_id + '_' + organizationId.replace(/-/g, ''),
            actions: rp.actions,
            created_at: new Date(),
            updated_at: new Date()
        }))

        await Database.table('role_permissions').useTransaction(trx).insert(organizationRolePermissions)
        console.log(`✅ Copied ${organizationRolePermissions.length} role permission relationships`)
    }

    /**
     * Seed role fields for organization by copying system role fields
     */
    private static async seedRoleFields(organizationId: string, trx: any) {
        console.log('📝 Seeding role fields...')

        // Get all system role fields (organization_id is null)
        const systemRoleFields = await RoleField.query({ client: trx })
            .whereNull('organization_id')

        if (systemRoleFields.length === 0) {
            console.log('⚠️ No system role fields found to copy')
            return
        }

        // Copy system role fields for this organization
        const organizationRoleFields = systemRoleFields.map(field => ({
            id: field.id + '_' + organizationId.replace(/-/g, ''), // Make unique ID
            role_id: field.roleId + '_' + organizationId.replace(/-/g, ''), // Reference organization role
            field_name: field.fieldName,
            field_label: field.fieldLabel,
            field_type: field.fieldType,
            field_options: JSON.stringify(field.fieldOptions),
            is_required: field.isRequired,
            sort_order: field.sortOrder,
            is_active: field.isActive,
            is_system_field: field.isSystemField,
            description: field.description,
            validation_rules: JSON.stringify(field.validationRules),
            organization_id: organizationId,
            created_at: new Date(),
            updated_at: new Date()
        }))

        await Database.table('role_fields').useTransaction(trx).insert(organizationRoleFields)
        console.log(`✅ Copied ${organizationRoleFields.length} role field records`)
    }

    /**
     * Seed system settings for organization by copying system settings
     */
    private static async seedSystemSettings(organizationId: string, trx: any) {
        console.log('⚙️ Seeding system settings...')

        // Get all system settings (organization_id is null)
        const systemSettings = await SystemSetting.query({ client: trx })
            .whereNull('organization_id')

        if (systemSettings.length === 0) {
            console.log('⚠️ No system settings found to copy')
            return
        }

        // Copy system settings for this organization
        const organizationSettings = systemSettings.map(setting => ({
            category: setting.category,
            key: setting.key,
            value: setting.value,
            type: setting.type,
            description: setting.description,
            is_editable: setting.isEditable,
            organization_id: organizationId,
            created_at: new Date(),
            updated_at: new Date()
        }))

        await Database.table('system_settings').useTransaction(trx).insert(organizationSettings)
        console.log(`✅ Copied ${organizationSettings.length} system setting records`)
    }
}
