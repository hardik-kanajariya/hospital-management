import type { HttpContext } from '@adonisjs/core/http'
import { promisify } from 'util'
import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'

export default class SystemController {
    /**
     * Get system health status
     */
    async health({ response }: HttpContext) {
        try {
            // Check database connection
            const dbStatus = await this.checkDatabaseConnection()

            // Get system uptime
            const uptime = os.uptime()
            const uptimePercentage = this.calculateUptimePercentage(uptime)

            // Get system performance metrics
            const performance = await this.getPerformanceMetrics()

            // Get application version
            const version = await this.getApplicationVersion()

            // Get last backup info
            const lastBackup = await this.getLastBackupInfo()

            const healthData = {
                status: dbStatus.healthy ? 'healthy' : 'unhealthy',
                database: {
                    status: dbStatus.healthy ? 'online' : 'offline',
                    latency: dbStatus.latency
                },
                uptime: uptimePercentage,
                version,
                lastBackup,
                performance,
                timestamp: new Date().toISOString()
            }

            return response.status(200).json({
                success: true,
                data: healthData,
                message: 'System health retrieved successfully'
            })

        } catch (error) {
            console.error('System health error:', error)
            return response.status(500).json({
                success: false,
                message: 'Error retrieving system health',
                data: {
                    status: 'unhealthy',
                    error: error.message
                }
            })
        }
    }

    /**
     * Get system performance metrics
     */
    async performance({ response }: HttpContext) {
        try {
            const metrics = await this.getPerformanceMetrics()

            return response.status(200).json({
                success: true,
                data: metrics,
                message: 'Performance metrics retrieved successfully'
            })

        } catch (error) {
            console.error('Performance metrics error:', error)
            return response.status(500).json({
                success: false,
                message: 'Error retrieving performance metrics'
            })
        }
    }

    /**
     * Create system backup
     */
    async createBackup({ response }: HttpContext) {
        try {
            const backupResult = await this.performBackup()

            if (backupResult.success) {
                return response.status(200).json({
                    success: true,
                    data: backupResult,
                    message: 'System backup created successfully'
                })
            } else {
                return response.status(500).json({
                    success: false,
                    message: backupResult.error || 'Failed to create backup'
                })
            }

        } catch (error) {
            console.error('Backup creation error:', error)
            return response.status(500).json({
                success: false,
                message: 'Error creating system backup'
            })
        }
    }

    /**
     * Get system logs
     */
    async logs({ request, response }: HttpContext) {
        try {
            const limit = request.input('limit', 50)
            const level = request.input('level', 'all') // error, warn, info, all

            const logs = await this.getSystemLogs(limit, level)

            return response.status(200).json({
                success: true,
                data: { logs },
                message: 'System logs retrieved successfully'
            })

        } catch (error) {
            console.error('System logs error:', error)
            return response.status(500).json({
                success: false,
                message: 'Error retrieving system logs'
            })
        }
    }

    /**
     * Get audit trail
     */
    async auditTrail({ request, response }: HttpContext) {
        try {
            const limit = request.input('limit', 10)
            const type = request.input('type', 'all')

            // This would typically come from an audit log table
            // For now, return mock data
            const activities = [
                {
                    id: '1',
                    action: 'System Started',
                    description: 'Hospital Management System initialized',
                    type: 'system',
                    createdAt: new Date().toISOString(),
                    user: { name: 'System' }
                }
            ]

            return response.status(200).json({
                success: true,
                data: { activities },
                message: 'Audit trail retrieved successfully'
            })

        } catch (error) {
            console.error('Audit trail error:', error)
            return response.status(500).json({
                success: false,
                message: 'Error retrieving audit trail'
            })
        }
    }

    /**
     * Get system uptime
     */
    async uptime({ response }: HttpContext) {
        try {
            const uptime = os.uptime()
            const uptimeData = {
                seconds: uptime,
                formatted: this.formatUptime(uptime),
                percentage: this.calculateUptimePercentage(uptime)
            }

            return response.status(200).json({
                success: true,
                data: uptimeData,
                message: 'System uptime retrieved successfully'
            })

        } catch (error) {
            console.error('System uptime error:', error)
            return response.status(500).json({
                success: false,
                message: 'Error retrieving system uptime'
            })
        }
    }

    /**
     * Get application version
     */
    async version({ response }: HttpContext) {
        try {
            const version = await this.getApplicationVersion()

            return response.status(200).json({
                success: true,
                data: { version },
                message: 'Application version retrieved successfully'
            })

        } catch (error) {
            console.error('Version retrieval error:', error)
            return response.status(500).json({
                success: false,
                message: 'Error retrieving application version'
            })
        }
    }

    /**
     * Get hospital settings (temporary endpoint)
     */
    async hospitalSettings({ response }: HttpContext) {
        try {
            // This would typically come from a settings table
            const settings = {
                // General Settings
                hospitalName: 'City General Hospital',
                hospitalAddress: '123 Medical Center Dr, Healthcare City',
                hospitalPhone: '+1 (555) 123-4567',
                hospitalEmail: 'admin@citygeneralhospital.com',

                // System Settings
                sessionTimeout: 30,
                maxLoginAttempts: 5,
                backupFrequency: 'daily',
                enableAuditLog: true,
                enableNotifications: true,
                enableEmailAlerts: true,
                autoBackupTime: '02:00',
                maintenanceMode: false,

                // Security Settings
                passwordMinLength: 8,
                requireSpecialChars: true,
                requireNumbers: true,
                requireUppercase: true,
                enableTwoFactor: false,
                lockoutDuration: 15,
                sessionIdleTimeout: 30,
                maxFileUploadSize: 10,

                // Performance Settings
                cacheEnabled: true,
                databaseOptimization: true,
                enableCompression: true,
                maxConcurrentUsers: 100,
                apiTimeout: 30,
                enableApiRateLimiting: true,
                maxRequestsPerMinute: 100,
                enableCDN: false,
            }

            return response.status(200).json({
                success: true,
                data: settings,
                message: 'Hospital settings retrieved successfully'
            })

        } catch (error) {
            console.error('Hospital settings error:', error)
            return response.status(500).json({
                success: false,
                message: 'Error retrieving hospital settings'
            })
        }
    }

    /**
     * Update hospital settings (temporary endpoint)
     */
    async updateHospitalSettings({ request, response }: HttpContext) {
        try {
            const settingsData = request.only([
                // General Settings
                'hospitalName',
                'hospitalAddress',
                'hospitalPhone',
                'hospitalEmail',

                // System Settings
                'sessionTimeout',
                'maxLoginAttempts',
                'backupFrequency',
                'enableAuditLog',
                'enableNotifications',
                'enableEmailAlerts',
                'autoBackupTime',
                'maintenanceMode',

                // Security Settings
                'passwordMinLength',
                'requireSpecialChars',
                'requireNumbers',
                'requireUppercase',
                'enableTwoFactor',
                'lockoutDuration',
                'sessionIdleTimeout',
                'maxFileUploadSize',

                // Performance Settings
                'cacheEnabled',
                'databaseOptimization',
                'enableCompression',
                'maxConcurrentUsers',
                'apiTimeout',
                'enableApiRateLimiting',
                'maxRequestsPerMinute',
                'enableCDN'
            ])

            // Validate required fields
            const validationErrors: string[] = []

            if (!settingsData.hospitalName?.trim()) {
                validationErrors.push('Hospital name is required')
            }
            if (!settingsData.hospitalEmail?.trim()) {
                validationErrors.push('Hospital email is required')
            }
            if (!settingsData.hospitalPhone?.trim()) {
                validationErrors.push('Hospital phone is required')
            }

            // Validate numeric ranges
            if (settingsData.sessionTimeout && (settingsData.sessionTimeout < 5 || settingsData.sessionTimeout > 480)) {
                validationErrors.push('Session timeout must be between 5 and 480 minutes')
            }
            if (settingsData.maxLoginAttempts && (settingsData.maxLoginAttempts < 1 || settingsData.maxLoginAttempts > 10)) {
                validationErrors.push('Max login attempts must be between 1 and 10')
            }
            if (settingsData.passwordMinLength && (settingsData.passwordMinLength < 6 || settingsData.passwordMinLength > 32)) {
                validationErrors.push('Password minimum length must be between 6 and 32 characters')
            }

            if (validationErrors.length > 0) {
                return response.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validationErrors
                })
            }

            // This would typically update a settings table
            console.log('Updating hospital settings:', settingsData)

            return response.status(200).json({
                success: true,
                data: settingsData,
                message: 'Hospital settings updated successfully'
            })

        } catch (error) {
            console.error('Hospital settings update error:', error)
            return response.status(500).json({
                success: false,
                message: 'Error updating hospital settings'
            })
        }
    }

    // Helper methods

    private async checkDatabaseConnection(): Promise<{ healthy: boolean; latency?: number }> {
        try {
            const start = Date.now()
            // You would check your actual database connection here
            // For now, we'll assume it's healthy
            const latency = Date.now() - start

            return { healthy: true, latency }
        } catch (error) {
            return { healthy: false }
        }
    }

    private async getPerformanceMetrics() {
        const totalMem = os.totalmem()
        const freeMem = os.freemem()
        const usedMem = totalMem - freeMem

        return {
            cpu: os.loadavg()[0] * 100 / os.cpus().length, // Approximate CPU usage
            memory: Math.round((usedMem / totalMem) * 100),
            disk: await this.getDiskUsage()
        }
    }

    private async getDiskUsage(): Promise<number> {
        try {
            // This is a simplified disk usage check
            // In production, you'd want more accurate disk space monitoring
            return 45 // Mock value - 45% disk usage
        } catch {
            return 0
        }
    }

    private async getApplicationVersion(): Promise<string> {
        try {
            const packagePath = path.join(process.cwd(), 'package.json')
            if (fs.existsSync(packagePath)) {
                const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
                return packageJson.version || '1.0.0'
            }
            return '1.0.0'
        } catch {
            return '1.0.0'
        }
    }

    private async getLastBackupInfo(): Promise<string | null> {
        try {
            // This would check your backup directory or database
            // For now, return null (no backup found)
            return null
        } catch {
            return null
        }
    }

    private async performBackup(): Promise<{ success: boolean; error?: string; filename?: string }> {
        try {
            // This would perform an actual backup
            // For now, we'll simulate a successful backup
            const filename = `backup_${Date.now()}.sql`

            // Simulate backup process
            await new Promise(resolve => setTimeout(resolve, 1000))

            return {
                success: true,
                filename
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            }
        }
    }

    private async getSystemLogs(limit: number, level: string): Promise<any[]> {
        try {
            // This would read from actual log files
            // For now, return mock logs
            return [
                {
                    id: 1,
                    level: 'info',
                    message: 'System started successfully',
                    timestamp: new Date().toISOString()
                }
            ]
        } catch {
            return []
        }
    }

    private formatUptime(seconds: number): string {
        const days = Math.floor(seconds / 86400)
        const hours = Math.floor((seconds % 86400) / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)

        return `${days}d ${hours}h ${minutes}m`
    }

    private calculateUptimePercentage(seconds: number): string {
        // Assume 99.9% uptime for demo purposes
        // In production, this would be calculated based on actual downtime tracking
        const uptimePercent = Math.min(99.9, (seconds / (30 * 24 * 3600)) * 100)
        return `${uptimePercent.toFixed(1)}%`
    }
}
