import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    async up() {
        // Add organization_id to master_data table if it doesn't exist
        const hasOrgIdInMasterData = await this.schema.hasColumn('master_data', 'organization_id')
        if (!hasOrgIdInMasterData) {
            this.schema.alterTable('master_data', (table) => {
                table.uuid('organization_id').nullable().references('id').inTable('organizations').onDelete('CASCADE')
                table.index(['organization_id'])
                table.index(['organization_id', 'category'])
                table.index(['organization_id', 'category', 'is_active'])
            })
        }

        // Add organization_id to permissions table if it doesn't exist
        const hasOrgIdInPermissions = await this.schema.hasColumn('permissions', 'organization_id')
        if (!hasOrgIdInPermissions) {
            this.schema.alterTable('permissions', (table) => {
                table.uuid('organization_id').nullable().references('id').inTable('organizations').onDelete('CASCADE')
                table.index(['organization_id'])
                table.index(['organization_id', 'module'])
            })
        }

        // Add organization_id to system_settings table if it doesn't exist
        const hasOrgIdInSystemSettings = await this.schema.hasColumn('system_settings', 'organization_id')
        if (!hasOrgIdInSystemSettings) {
            this.schema.alterTable('system_settings', (table) => {
                table.uuid('organization_id').nullable().references('id').inTable('organizations').onDelete('CASCADE')
                table.index(['organization_id'])
                table.index(['organization_id', 'category'])
            })
        }

        // Add organization_id to role_fields table if it doesn't exist
        const hasOrgIdInRoleFields = await this.schema.hasColumn('role_fields', 'organization_id')
        if (!hasOrgIdInRoleFields) {
            this.schema.alterTable('role_fields', (table) => {
                table.uuid('organization_id').nullable().references('id').inTable('organizations').onDelete('CASCADE')
                table.index(['organization_id'])
                table.index(['organization_id', 'role_id'])
            })
        }
    }

    async down() {
        const hasOrgIdInMasterData = await this.schema.hasColumn('master_data', 'organization_id')
        if (hasOrgIdInMasterData) {
            this.schema.alterTable('master_data', (table) => {
                table.dropIndex(['organization_id'])
                table.dropIndex(['organization_id', 'category'])
                table.dropIndex(['organization_id', 'category', 'is_active'])
                table.dropColumn('organization_id')
            })
        }

        const hasOrgIdInPermissions = await this.schema.hasColumn('permissions', 'organization_id')
        if (hasOrgIdInPermissions) {
            this.schema.alterTable('permissions', (table) => {
                table.dropIndex(['organization_id'])
                table.dropIndex(['organization_id', 'module'])
                table.dropColumn('organization_id')
            })
        }

        const hasOrgIdInSystemSettings = await this.schema.hasColumn('system_settings', 'organization_id')
        if (hasOrgIdInSystemSettings) {
            this.schema.alterTable('system_settings', (table) => {
                table.dropIndex(['organization_id'])
                table.dropIndex(['organization_id', 'category'])
                table.dropColumn('organization_id')
            })
        }

        const hasOrgIdInRoleFields = await this.schema.hasColumn('role_fields', 'organization_id')
        if (hasOrgIdInRoleFields) {
            this.schema.alterTable('role_fields', (table) => {
                table.dropIndex(['organization_id'])
                table.dropIndex(['organization_id', 'role_id'])
                table.dropColumn('organization_id')
            })
        }
    }
}
