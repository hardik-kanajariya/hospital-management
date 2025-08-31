import type { HttpContext } from '@adonisjs/core/http'
import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'
import { SystemSettingsService } from '#services/system_settings_service'
import { AuditService } from '#services/audit_service'
import Database from '@adonisjs/lucid/services/db'

export default class SystemController {
    private systemSettingsService = new SystemSettingsService()
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
    async createBackup(ctx: HttpContext) {
        const { response } = ctx
        try {
            const backupResult = await this.performBackup()

            // Log the backup activity
            await AuditService.logBackup(
                ctx,
                backupResult.success,
                backupResult.filename,
                backupResult.error
            )

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
            const userId = request.input('userId')
            const action = request.input('action')

            const activities = await AuditService.getAuditLogs(
                parseInt(limit),
                type,
                userId ? parseInt(userId) : undefined,
                action
            )

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
     * Get hospital settings
     */
    async hospitalSettings({ response }: HttpContext) {
        try {
            const settings = await this.systemSettingsService.getAllSettings()

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
     * Update hospital settings
     */
    async updateHospitalSettings(ctx: HttpContext) {
        const { request, response } = ctx
        try {
            const settingsData = request.only([
                'hospitalName',
                'hospitalAddress',
                'hospitalPhone',
                'hospitalEmail',
                'sessionTimeout',
                'maxLoginAttempts',
                'backupFrequency',
                'enableAuditLog',
                'enableNotifications',
                'enableEmailAlerts',
                'autoBackupTime',
                'maintenanceMode',
                'passwordMinLength',
                'requireSpecialChars',
                'requireNumbers',
                'requireUppercase',
                'enableTwoFactor',
                'lockoutDuration',
                'sessionIdleTimeout',
                'maxFileUploadSize',
                'cacheEnabled',
                'databaseOptimization',
                'enableCompression',
                'maxConcurrentUsers',
                'apiTimeout',
                'enableApiRateLimiting',
                'maxRequestsPerMinute',
                'enableCDN'
            ])

            // Validate settings
            const validationErrors = this.systemSettingsService.validateSettings(settingsData)

            if (validationErrors.length > 0) {
                return response.status(422).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validationErrors
                })
            }

            // Get current settings for audit logging
            const currentSettings = await this.systemSettingsService.getAllSettings()

            // Update settings
            await this.systemSettingsService.updateSettings(settingsData)

            // Log settings changes
            for (const [key, newValue] of Object.entries(settingsData)) {
                const oldValue = (currentSettings as any)[key]
                if (oldValue !== newValue) {
                    await AuditService.logSettingChange(ctx, key, oldValue, newValue)
                }
            }

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
            // Check actual database connection using a simple query
            await Database.rawQuery('SELECT 1')
            const latency = Date.now() - start

            return { healthy: true, latency }
        } catch (error) {
            console.error('Database connection check failed:', error)
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
            const lastBackup = await this.systemSettingsService.getSetting('system', 'last_backup')
            return lastBackup || null
        } catch {
            return null
        }
    }

    private async performBackup(): Promise<{ success: boolean; error?: string; filename?: string }> {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
            const filename = `backup_${timestamp}.sql`
            const backupPath = path.join(process.cwd(), 'storage', 'backups')

            // Ensure backup directory exists
            if (!fs.existsSync(backupPath)) {
                fs.mkdirSync(backupPath, { recursive: true })
            }

            const fullPath = path.join(backupPath, filename)

            // Get database connection info from environment
            const dbConfig = {
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || '3306',
                database: process.env.DB_DATABASE || 'hospital_management',
                username: process.env.DB_USERNAME || 'root',
                password: process.env.DB_PASSWORD || ''
            }

            // Create mysqldump command
            const dumpCommand = `mysqldump -h ${dbConfig.host} -P ${dbConfig.port} -u ${dbConfig.username} ${dbConfig.password ? `-p${dbConfig.password}` : ''} ${dbConfig.database} > "${fullPath}"`

            // Execute backup command
            const { exec } = require('child_process')
            const { promisify } = require('util')
            const execAsync = promisify(exec)

            await execAsync(dumpCommand)

            // Update backup setting
            await this.systemSettingsService.setSetting('system', 'last_backup', new Date().toISOString())

            return {
                success: true,
                filename
            }
        } catch (error) {
            console.error('Backup error:', error)
            return {
                success: false,
                error: error.message
            }
        }
    }

    private async getSystemLogs(limit: number, level: string): Promise<any[]> {
        try {
            // Read from log files if they exist
            const logPath = path.join(process.cwd(), 'storage', 'logs')
            const logFile = path.join(logPath, 'app.log')

            if (fs.existsSync(logFile)) {
                const logContent = fs.readFileSync(logFile, 'utf8')
                const logLines = logContent.split('\n').filter(line => line.trim())

                // Filter by level if specified
                let filteredLogs = logLines
                if (level !== 'all') {
                    filteredLogs = logLines.filter(line =>
                        line.toLowerCase().includes(level.toLowerCase())
                    )
                }

                // Limit results
                const limitedLogs = filteredLogs.slice(-limit)

                // Parse log lines into objects
                return limitedLogs.map((line, index) => ({
                    id: index + 1,
                    level: this.extractLogLevel(line),
                    message: this.extractLogMessage(line),
                    timestamp: this.extractLogTimestamp(line) || new Date().toISOString()
                }))
            }

            // Return mock logs if no log file exists
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

    private extractLogLevel(logLine: string): string {
        const levelMatch = logLine.match(/\[(error|warn|info|debug)\]/i)
        return levelMatch ? levelMatch[1].toLowerCase() : 'info'
    }

    private extractLogMessage(logLine: string): string {
        // Extract message after timestamp and level
        const messageMatch = logLine.match(/\[[^\]]+\]\s*(.+)/)
        return messageMatch ? messageMatch[1] : logLine
    }

    private extractLogTimestamp(logLine: string): string | null {
        // Try to extract ISO timestamp
        const timestampMatch = logLine.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z)/)
        return timestampMatch ? timestampMatch[1] : null
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
