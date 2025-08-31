import SystemSetting from '#models/system_setting'
import { DateTime } from 'luxon'

export interface SystemSettingsData {
    // General Settings
    hospitalName: string
    hospitalAddress: string
    hospitalPhone: string
    hospitalEmail: string

    // System Settings
    sessionTimeout: number
    maxLoginAttempts: number
    backupFrequency: string
    enableAuditLog: boolean
    enableNotifications: boolean
    enableEmailAlerts: boolean
    autoBackupTime: string
    maintenanceMode: boolean

    // Security Settings
    passwordMinLength: number
    requireSpecialChars: boolean
    requireNumbers: boolean
    requireUppercase: boolean
    enableTwoFactor: boolean
    lockoutDuration: number
    sessionIdleTimeout: number
    maxFileUploadSize: number

    // Performance Settings
    cacheEnabled: boolean
    databaseOptimization: boolean
    enableCompression: boolean
    maxConcurrentUsers: number
    apiTimeout: number
    enableApiRateLimiting: boolean
    maxRequestsPerMinute: number
    enableCDN: boolean
}

export class SystemSettingsService {
    /**
     * Get all system settings formatted for the frontend
     */
    public async getAllSettings(): Promise<SystemSettingsData> {
        const settings = await SystemSetting.all()
        const settingsMap = new Map<string, SystemSetting>()

        settings.forEach(setting => {
            settingsMap.set(`${setting.category}.${setting.key}`, setting)
        })

        return {
            // General Settings
            hospitalName: this.getSettingValue(settingsMap, 'general.hospital_name', 'City General Hospital'),
            hospitalAddress: this.getSettingValue(settingsMap, 'general.hospital_address', '123 Medical Center Dr, Healthcare City'),
            hospitalPhone: this.getSettingValue(settingsMap, 'general.hospital_phone', '+1 (555) 123-4567'),
            hospitalEmail: this.getSettingValue(settingsMap, 'general.hospital_email', 'admin@citygeneralhospital.com'),

            // System Settings
            sessionTimeout: this.getSettingValue(settingsMap, 'system.session_timeout', 30),
            maxLoginAttempts: this.getSettingValue(settingsMap, 'system.max_login_attempts', 5),
            backupFrequency: this.getSettingValue(settingsMap, 'system.backup_frequency', 'daily'),
            enableAuditLog: this.getSettingValue(settingsMap, 'system.enable_audit_log', true),
            enableNotifications: this.getSettingValue(settingsMap, 'system.enable_notifications', true),
            enableEmailAlerts: this.getSettingValue(settingsMap, 'system.enable_email_alerts', true),
            autoBackupTime: this.getSettingValue(settingsMap, 'system.auto_backup_time', '02:00'),
            maintenanceMode: this.getSettingValue(settingsMap, 'system.maintenance_mode', false),

            // Security Settings
            passwordMinLength: this.getSettingValue(settingsMap, 'security.password_min_length', 8),
            requireSpecialChars: this.getSettingValue(settingsMap, 'security.require_special_chars', true),
            requireNumbers: this.getSettingValue(settingsMap, 'security.require_numbers', true),
            requireUppercase: this.getSettingValue(settingsMap, 'security.require_uppercase', true),
            enableTwoFactor: this.getSettingValue(settingsMap, 'security.enable_two_factor', false),
            lockoutDuration: this.getSettingValue(settingsMap, 'security.lockout_duration', 15),
            sessionIdleTimeout: this.getSettingValue(settingsMap, 'security.session_idle_timeout', 30),
            maxFileUploadSize: this.getSettingValue(settingsMap, 'security.max_file_upload_size', 10),

            // Performance Settings
            cacheEnabled: this.getSettingValue(settingsMap, 'performance.cache_enabled', true),
            databaseOptimization: this.getSettingValue(settingsMap, 'performance.database_optimization', true),
            enableCompression: this.getSettingValue(settingsMap, 'performance.enable_compression', true),
            maxConcurrentUsers: this.getSettingValue(settingsMap, 'performance.max_concurrent_users', 100),
            apiTimeout: this.getSettingValue(settingsMap, 'performance.api_timeout', 30),
            enableApiRateLimiting: this.getSettingValue(settingsMap, 'performance.enable_api_rate_limiting', true),
            maxRequestsPerMinute: this.getSettingValue(settingsMap, 'performance.max_requests_per_minute', 100),
            enableCDN: this.getSettingValue(settingsMap, 'performance.enable_cdn', false),
        }
    }

    /**
     * Update system settings
     */
    public async updateSettings(settingsData: Partial<SystemSettingsData>): Promise<void> {
        const settingsToUpdate = [
            // General Settings
            { category: 'general', key: 'hospital_name', value: settingsData.hospitalName, type: 'string' as const },
            { category: 'general', key: 'hospital_address', value: settingsData.hospitalAddress, type: 'string' as const },
            { category: 'general', key: 'hospital_phone', value: settingsData.hospitalPhone, type: 'string' as const },
            { category: 'general', key: 'hospital_email', value: settingsData.hospitalEmail, type: 'string' as const },

            // System Settings
            { category: 'system', key: 'session_timeout', value: settingsData.sessionTimeout, type: 'number' as const },
            { category: 'system', key: 'max_login_attempts', value: settingsData.maxLoginAttempts, type: 'number' as const },
            { category: 'system', key: 'backup_frequency', value: settingsData.backupFrequency, type: 'string' as const },
            { category: 'system', key: 'enable_audit_log', value: settingsData.enableAuditLog, type: 'boolean' as const },
            { category: 'system', key: 'enable_notifications', value: settingsData.enableNotifications, type: 'boolean' as const },
            { category: 'system', key: 'enable_email_alerts', value: settingsData.enableEmailAlerts, type: 'boolean' as const },
            { category: 'system', key: 'auto_backup_time', value: settingsData.autoBackupTime, type: 'string' as const },
            { category: 'system', key: 'maintenance_mode', value: settingsData.maintenanceMode, type: 'boolean' as const },

            // Security Settings
            { category: 'security', key: 'password_min_length', value: settingsData.passwordMinLength, type: 'number' as const },
            { category: 'security', key: 'require_special_chars', value: settingsData.requireSpecialChars, type: 'boolean' as const },
            { category: 'security', key: 'require_numbers', value: settingsData.requireNumbers, type: 'boolean' as const },
            { category: 'security', key: 'require_uppercase', value: settingsData.requireUppercase, type: 'boolean' as const },
            { category: 'security', key: 'enable_two_factor', value: settingsData.enableTwoFactor, type: 'boolean' as const },
            { category: 'security', key: 'lockout_duration', value: settingsData.lockoutDuration, type: 'number' as const },
            { category: 'security', key: 'session_idle_timeout', value: settingsData.sessionIdleTimeout, type: 'number' as const },
            { category: 'security', key: 'max_file_upload_size', value: settingsData.maxFileUploadSize, type: 'number' as const },

            // Performance Settings
            { category: 'performance', key: 'cache_enabled', value: settingsData.cacheEnabled, type: 'boolean' as const },
            { category: 'performance', key: 'database_optimization', value: settingsData.databaseOptimization, type: 'boolean' as const },
            { category: 'performance', key: 'enable_compression', value: settingsData.enableCompression, type: 'boolean' as const },
            { category: 'performance', key: 'max_concurrent_users', value: settingsData.maxConcurrentUsers, type: 'number' as const },
            { category: 'performance', key: 'api_timeout', value: settingsData.apiTimeout, type: 'number' as const },
            { category: 'performance', key: 'enable_api_rate_limiting', value: settingsData.enableApiRateLimiting, type: 'boolean' as const },
            { category: 'performance', key: 'max_requests_per_minute', value: settingsData.maxRequestsPerMinute, type: 'number' as const },
            { category: 'performance', key: 'enable_cdn', value: settingsData.enableCDN, type: 'boolean' as const },
        ]

        // Update each setting
        for (const settingUpdate of settingsToUpdate) {
            if (settingUpdate.value !== undefined) {
                const setting = await SystemSetting.query()
                    .where('category', settingUpdate.category)
                    .where('key', settingUpdate.key)
                    .first()

                if (setting) {
                    setting.setTypedValue(settingUpdate.value)
                    setting.updatedAt = DateTime.now()
                    await setting.save()
                } else {
                    // Create new setting if it doesn't exist
                    const newSetting = new SystemSetting()
                    newSetting.category = settingUpdate.category
                    newSetting.key = settingUpdate.key
                    newSetting.type = settingUpdate.type
                    newSetting.setTypedValue(settingUpdate.value)
                    newSetting.isEditable = true
                    await newSetting.save()
                }
            }
        }
    }

    /**
     * Get a specific setting value
     */
    public async getSetting(category: string, key: string): Promise<any> {
        const setting = await SystemSetting.query()
            .where('category', category)
            .where('key', key)
            .first()

        return setting ? setting.getTypedValue() : null
    }

    /**
     * Set a specific setting value
     */
    public async setSetting(category: string, key: string, value: any, type: 'string' | 'number' | 'boolean' | 'json' = 'string'): Promise<void> {
        const setting = await SystemSetting.query()
            .where('category', category)
            .where('key', key)
            .first()

        if (setting) {
            setting.setTypedValue(value)
            setting.updatedAt = DateTime.now()
            await setting.save()
        } else {
            const newSetting = new SystemSetting()
            newSetting.category = category
            newSetting.key = key
            newSetting.type = type
            newSetting.setTypedValue(value)
            newSetting.isEditable = true
            await newSetting.save()
        }
    }

    /**
     * Helper method to get setting value with fallback
     */
    private getSettingValue(settingsMap: Map<string, SystemSetting>, key: string, defaultValue: any): any {
        const setting = settingsMap.get(key)
        return setting ? setting.getTypedValue() : defaultValue
    }

    /**
     * Validate settings data
     */
    public validateSettings(settingsData: Partial<SystemSettingsData>): string[] {
        const errors: string[] = []

        // General Settings Validation
        if (settingsData.hospitalName !== undefined && !settingsData.hospitalName.trim()) {
            errors.push('Hospital name is required')
        }
        if (settingsData.hospitalEmail !== undefined && settingsData.hospitalEmail.trim() &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settingsData.hospitalEmail)) {
            errors.push('Please enter a valid email address')
        }
        if (settingsData.hospitalPhone !== undefined && !settingsData.hospitalPhone.trim()) {
            errors.push('Hospital phone number is required')
        }

        // System Settings Validation
        if (settingsData.sessionTimeout !== undefined &&
            (settingsData.sessionTimeout < 5 || settingsData.sessionTimeout > 480)) {
            errors.push('Session timeout must be between 5 and 480 minutes')
        }
        if (settingsData.maxLoginAttempts !== undefined &&
            (settingsData.maxLoginAttempts < 1 || settingsData.maxLoginAttempts > 10)) {
            errors.push('Max login attempts must be between 1 and 10')
        }

        // Security Settings Validation
        if (settingsData.passwordMinLength !== undefined &&
            (settingsData.passwordMinLength < 6 || settingsData.passwordMinLength > 32)) {
            errors.push('Password length must be between 6 and 32 characters')
        }
        if (settingsData.lockoutDuration !== undefined &&
            (settingsData.lockoutDuration < 1 || settingsData.lockoutDuration > 60)) {
            errors.push('Lockout duration must be between 1 and 60 minutes')
        }
        if (settingsData.maxFileUploadSize !== undefined &&
            (settingsData.maxFileUploadSize < 1 || settingsData.maxFileUploadSize > 100)) {
            errors.push('File upload size must be between 1 and 100 MB')
        }

        // Performance Settings Validation
        if (settingsData.maxConcurrentUsers !== undefined &&
            (settingsData.maxConcurrentUsers < 10 || settingsData.maxConcurrentUsers > 1000)) {
            errors.push('Max concurrent users must be between 10 and 1000')
        }
        if (settingsData.apiTimeout !== undefined &&
            (settingsData.apiTimeout < 10 || settingsData.apiTimeout > 120)) {
            errors.push('API timeout must be between 10 and 120 seconds')
        }
        if (settingsData.maxRequestsPerMinute !== undefined &&
            (settingsData.maxRequestsPerMinute < 10 || settingsData.maxRequestsPerMinute > 1000)) {
            errors.push('Max requests per minute must be between 10 and 1000')
        }

        return errors
    }
}
