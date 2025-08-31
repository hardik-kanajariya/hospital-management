import AuditLog from '#models/audit_log'
import type { HttpContext } from '@adonisjs/core/http'

export interface AuditLogData {
    action: string
    description: string
    type: 'system' | 'user' | 'role' | 'permission' | 'setting' | 'backup' | 'login' | 'logout'
    entityType?: string
    entityId?: string
    metadata?: any
    userId?: number
    ipAddress?: string
    userAgent?: string
}

export class AuditService {
    /**
     * Create an audit log entry
     */
    public static async log(data: AuditLogData): Promise<AuditLog> {
        const auditLog = new AuditLog()

        auditLog.action = data.action
        auditLog.description = data.description
        auditLog.type = data.type
        auditLog.userId = data.userId || null
        auditLog.entityType = data.entityType || null
        auditLog.entityId = data.entityId || null
        auditLog.ipAddress = data.ipAddress || null
        auditLog.userAgent = data.userAgent || null

        if (data.metadata) {
            auditLog.setMetadata(data.metadata)
        }

        await auditLog.save()
        return auditLog
    }

    /**
     * Create audit log from HTTP context
     */
    public static async logFromContext(ctx: HttpContext, data: Omit<AuditLogData, 'userId' | 'ipAddress' | 'userAgent'>): Promise<AuditLog> {
        return this.log({
            ...data,
            userId: ctx.auth?.user?.id ? parseInt(ctx.auth.user.id.toString()) : undefined,
            ipAddress: ctx.request.ip(),
            userAgent: ctx.request.header('user-agent')
        })
    }

    /**
     * Log system setting changes
     */
    public static async logSettingChange(
        ctx: HttpContext,
        settingKey: string,
        oldValue: any,
        newValue: any
    ): Promise<AuditLog> {
        return this.logFromContext(ctx, {
            action: 'Setting Updated',
            description: `System setting '${settingKey}' was updated`,
            type: 'setting',
            entityType: 'system_setting',
            entityId: settingKey,
            metadata: {
                setting: settingKey,
                oldValue,
                newValue
            }
        })
    }

    /**
     * Log system backup
     */
    public static async logBackup(
        ctx: HttpContext,
        success: boolean,
        filename?: string,
        error?: string
    ): Promise<AuditLog> {
        return this.logFromContext(ctx, {
            action: success ? 'Backup Created' : 'Backup Failed',
            description: success
                ? `System backup created successfully: ${filename}`
                : `System backup failed: ${error}`,
            type: 'backup',
            entityType: 'system_backup',
            entityId: filename || 'failed',
            metadata: {
                success,
                filename,
                error
            }
        })
    }

    /**
     * Log user login
     */
    public static async logLogin(
        ctx: HttpContext,
        userId: number,
        success: boolean,
        error?: string
    ): Promise<AuditLog> {
        return this.log({
            action: success ? 'User Login' : 'Login Failed',
            description: success
                ? `User logged in successfully`
                : `Login failed: ${error}`,
            type: 'login',
            entityType: 'user',
            entityId: userId.toString(),
            userId: success ? userId : undefined,
            ipAddress: ctx.request.ip(),
            userAgent: ctx.request.header('user-agent'),
            metadata: {
                success,
                error
            }
        })
    }

    /**
     * Log user logout
     */
    public static async logLogout(ctx: HttpContext, userId: number): Promise<AuditLog> {
        return this.log({
            action: 'User Logout',
            description: 'User logged out',
            type: 'logout',
            entityType: 'user',
            entityId: userId.toString(),
            userId,
            ipAddress: ctx.request.ip(),
            userAgent: ctx.request.header('user-agent')
        })
    }

    /**
     * Get audit logs with filters
     */
    public static async getAuditLogs(
        limit: number = 50,
        type?: string,
        userId?: number,
        action?: string
    ): Promise<AuditLog[]> {
        const query = AuditLog.query()
            .preload('user')
            .orderBy('created_at', 'desc')
            .limit(limit)

        if (type && type !== 'all') {
            query.where('type', type)
        }

        if (userId) {
            query.where('user_id', userId)
        }

        if (action) {
            query.where('action', 'like', `%${action}%`)
        }

        return await query
    }

    /**
     * Get recent activities for dashboard
     */
    public static async getRecentActivities(limit: number = 10): Promise<any[]> {
        const auditLogs = await AuditLog.query()
            .preload('user')
            .orderBy('created_at', 'desc')
            .limit(limit)

        return auditLogs.map(log => ({
            id: log.id.toString(),
            action: log.action,
            details: log.description,
            time: this.formatTimeAgo(log.createdAt.toJSDate()),
            type: log.type,
            user: log.user?.name || 'System'
        }))
    }

    /**
     * Format time ago helper
     */
    private static formatTimeAgo(date: Date): string {
        const now = new Date()
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

        if (diffInMinutes < 1) {
            return 'Just now'
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
        } else if (diffInMinutes < 1440) {
            const hours = Math.floor(diffInMinutes / 60)
            return `${hours} hour${hours === 1 ? '' : 's'} ago`
        } else {
            const days = Math.floor(diffInMinutes / 1440)
            return `${days} day${days === 1 ? '' : 's'} ago`
        }
    }
}
