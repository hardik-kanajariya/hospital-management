import { BaseSeeder } from '@adonisjs/lucid/seeders'
import SystemSetting from '#models/system_setting'

export default class extends BaseSeeder {
    async run() {
        const defaultSettings = [
            // General Settings
            {
                category: 'general',
                key: 'hospital_name',
                value: 'City General Hospital',
                type: 'string' as const,
                description: 'Hospital name displayed throughout the system',
                isEditable: true
            },
            {
                category: 'general',
                key: 'hospital_address',
                value: '123 Medical Center Dr, Healthcare City',
                type: 'string' as const,
                description: 'Complete hospital address',
                isEditable: true
            },
            {
                category: 'general',
                key: 'hospital_phone',
                value: '+1 (555) 123-4567',
                type: 'string' as const,
                description: 'Hospital main phone number',
                isEditable: true
            },
            {
                category: 'general',
                key: 'hospital_email',
                value: 'admin@citygeneralhospital.com',
                type: 'string' as const,
                description: 'Hospital official email address',
                isEditable: true
            },

            // System Settings
            {
                category: 'system',
                key: 'session_timeout',
                value: '30',
                type: 'number' as const,
                description: 'Session timeout in minutes',
                isEditable: true
            },
            {
                category: 'system',
                key: 'max_login_attempts',
                value: '5',
                type: 'number' as const,
                description: 'Maximum number of login attempts before lockout',
                isEditable: true
            },
            {
                category: 'system',
                key: 'backup_frequency',
                value: 'daily',
                type: 'string' as const,
                description: 'Automatic backup frequency',
                isEditable: true
            },
            {
                category: 'system',
                key: 'enable_audit_log',
                value: 'true',
                type: 'boolean' as const,
                description: 'Enable system audit logging',
                isEditable: true
            },
            {
                category: 'system',
                key: 'enable_notifications',
                value: 'true',
                type: 'boolean' as const,
                description: 'Enable system notifications',
                isEditable: true
            },
            {
                category: 'system',
                key: 'enable_email_alerts',
                value: 'true',
                type: 'boolean' as const,
                description: 'Enable email alerts',
                isEditable: true
            },
            {
                category: 'system',
                key: 'auto_backup_time',
                value: '02:00',
                type: 'string' as const,
                description: 'Automatic backup time (24-hour format)',
                isEditable: true
            },
            {
                category: 'system',
                key: 'maintenance_mode',
                value: 'false',
                type: 'boolean' as const,
                description: 'System maintenance mode',
                isEditable: true
            },

            // Security Settings
            {
                category: 'security',
                key: 'password_min_length',
                value: '8',
                type: 'number' as const,
                description: 'Minimum password length',
                isEditable: true
            },
            {
                category: 'security',
                key: 'require_special_chars',
                value: 'true',
                type: 'boolean' as const,
                description: 'Require special characters in passwords',
                isEditable: true
            },
            {
                category: 'security',
                key: 'require_numbers',
                value: 'true',
                type: 'boolean' as const,
                description: 'Require numbers in passwords',
                isEditable: true
            },
            {
                category: 'security',
                key: 'require_uppercase',
                value: 'true',
                type: 'boolean' as const,
                description: 'Require uppercase letters in passwords',
                isEditable: true
            },
            {
                category: 'security',
                key: 'enable_two_factor',
                value: 'false',
                type: 'boolean' as const,
                description: 'Enable two-factor authentication',
                isEditable: true
            },
            {
                category: 'security',
                key: 'lockout_duration',
                value: '15',
                type: 'number' as const,
                description: 'Account lockout duration in minutes',
                isEditable: true
            },
            {
                category: 'security',
                key: 'session_idle_timeout',
                value: '30',
                type: 'number' as const,
                description: 'Session idle timeout in minutes',
                isEditable: true
            },
            {
                category: 'security',
                key: 'max_file_upload_size',
                value: '10',
                type: 'number' as const,
                description: 'Maximum file upload size in MB',
                isEditable: true
            },

            // Performance Settings
            {
                category: 'performance',
                key: 'cache_enabled',
                value: 'true',
                type: 'boolean' as const,
                description: 'Enable application caching',
                isEditable: true
            },
            {
                category: 'performance',
                key: 'database_optimization',
                value: 'true',
                type: 'boolean' as const,
                description: 'Enable database query optimization',
                isEditable: true
            },
            {
                category: 'performance',
                key: 'enable_compression',
                value: 'true',
                type: 'boolean' as const,
                description: 'Enable API response compression',
                isEditable: true
            },
            {
                category: 'performance',
                key: 'max_concurrent_users',
                value: '100',
                type: 'number' as const,
                description: 'Maximum concurrent users',
                isEditable: true
            },
            {
                category: 'performance',
                key: 'api_timeout',
                value: '30',
                type: 'number' as const,
                description: 'API request timeout in seconds',
                isEditable: true
            },
            {
                category: 'performance',
                key: 'enable_api_rate_limiting',
                value: 'true',
                type: 'boolean' as const,
                description: 'Enable API rate limiting',
                isEditable: true
            },
            {
                category: 'performance',
                key: 'max_requests_per_minute',
                value: '100',
                type: 'number' as const,
                description: 'Maximum API requests per minute',
                isEditable: true
            },
            {
                category: 'performance',
                key: 'enable_cdn',
                value: 'false',
                type: 'boolean' as const,
                description: 'Enable Content Delivery Network',
                isEditable: true
            }
        ]

        // Use updateOrCreate to avoid duplicates while preserving user changes
        for (const setting of defaultSettings) {
            await SystemSetting.updateOrCreate(
                {
                    category: setting.category,
                    key: setting.key
                },
                setting
            )
        }

        console.log('✅ System settings seeded successfully')
    }
}
