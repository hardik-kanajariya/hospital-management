import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'
import User from '#models/user'
import { DateTime } from 'luxon'
import { v4 as uuid } from 'uuid'
import { notificationValidator, updateNotificationValidator } from '#validators/notification'

export default class NotificationsController {
    /**
     * Get all notifications with pagination and filters
     */
    async index({ request, response }: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('limit', 10)
            const userId = request.input('userId', '')
            const type = request.input('type', '')
            const isRead = request.input('isRead', '')
            const priority = request.input('priority', '')

            let query = Notification.query()
                .preload('user')

            if (userId) {
                query = query.where('user_id', userId)
            }

            if (type) {
                query = query.where('type', type)
            }

            if (isRead !== '') {
                query = query.where('is_read', isRead === 'true')
            }

            if (priority) {
                query = query.where('priority', priority)
            }

            query = query.orderBy('created_at', 'desc')

            const notifications = await query.paginate(page, limit)

            return response.status(200).json({
                success: true,
                data: notifications,
                message: 'Notifications retrieved successfully'
            })

        } catch (error) {
            console.error('Notifications index error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving notifications'
            })
        }
    }

    /**
     * Get single notification by ID
     */
    async show({ params, response }: HttpContext) {
        try {
            const notification = await Notification.query()
                .where('id', params.id)
                .preload('user')
                .first()

            if (!notification) {
                return response.status(404).json({
                    success: false,
                    message: 'Notification not found'
                })
            }

            return response.status(200).json({
                success: true,
                data: notification,
                message: 'Notification retrieved successfully'
            })

        } catch (error) {
            console.error('Notification show error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving notification'
            })
        }
    }

    /**
     * Create new notification
     */
    async store({ request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(notificationValidator)

            // Verify user exists
            const user = await User.find(payload.userId)

            if (!user) {
                return response.status(400).json({
                    success: false,
                    message: 'User not found'
                })
            }

            const notification = new Notification()
            notification.id = uuid()
            notification.userId = payload.userId
            notification.type = payload.type
            notification.title = payload.title
            notification.message = payload.message
            notification.priority = payload.priority || 'medium'
            notification.isRead = payload.isRead || false
            notification.data = payload.data || {}
            notification.actionUrl = payload.actionUrl || null
            notification.expiresAt = payload.expiresAt ? DateTime.fromJSDate(payload.expiresAt) : null

            await notification.save()

            // Load relationships
            await notification.load('user')

            return response.status(201).json({
                success: true,
                data: notification,
                message: 'Notification created successfully'
            })

        } catch (error) {
            console.error('Notification store error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while creating notification'
            })
        }
    }

    /**
     * Update notification
     */
    async update({ params, request, response }: HttpContext) {
        try {
            const notification = await Notification.find(params.id)

            if (!notification) {
                return response.status(404).json({
                    success: false,
                    message: 'Notification not found'
                })
            }

            const payload = await request.validateUsing(updateNotificationValidator)

            if (payload.type !== undefined) notification.type = payload.type
            if (payload.title !== undefined) notification.title = payload.title
            if (payload.message !== undefined) notification.message = payload.message
            if (payload.priority !== undefined) notification.priority = payload.priority
            if (payload.isRead !== undefined) notification.isRead = payload.isRead
            if (payload.data !== undefined) notification.data = payload.data
            if (payload.actionUrl !== undefined) notification.actionUrl = payload.actionUrl || null
            if (payload.expiresAt !== undefined) notification.expiresAt = payload.expiresAt ? DateTime.fromJSDate(payload.expiresAt) : null

            await notification.save()

            await notification.load('user')

            return response.status(200).json({
                success: true,
                data: notification,
                message: 'Notification updated successfully'
            })

        } catch (error) {
            console.error('Notification update error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while updating notification'
            })
        }
    }

    /**
     * Delete notification
     */
    async destroy({ params, response }: HttpContext) {
        try {
            const notification = await Notification.find(params.id)

            if (!notification) {
                return response.status(404).json({
                    success: false,
                    message: 'Notification not found'
                })
            }

            await notification.delete()

            return response.status(200).json({
                success: true,
                message: 'Notification deleted successfully'
            })

        } catch (error) {
            console.error('Notification destroy error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while deleting notification'
            })
        }
    }

    /**
     * Mark notification as read
     */
    async markAsRead({ params, response }: HttpContext) {
        try {
            const notification = await Notification.find(params.id)

            if (!notification) {
                return response.status(404).json({
                    success: false,
                    message: 'Notification not found'
                })
            }

            notification.isRead = true
            notification.readAt = DateTime.now()

            await notification.save()
            await notification.load('user')

            return response.status(200).json({
                success: true,
                data: notification,
                message: 'Notification marked as read'
            })

        } catch (error) {
            console.error('Mark notification as read error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while marking notification as read'
            })
        }
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead({ request, response }: HttpContext) {
        try {
            const userId = request.input('userId')

            if (!userId) {
                return response.status(400).json({
                    success: false,
                    message: 'User ID is required'
                })
            }

            await Notification.query()
                .where('user_id', userId)
                .where('is_read', false)
                .update({
                    is_read: true,
                    read_at: DateTime.now().toSQL()
                })

            return response.status(200).json({
                success: true,
                message: 'All notifications marked as read'
            })

        } catch (error) {
            console.error('Mark all notifications as read error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while marking all notifications as read'
            })
        }
    }

    /**
     * Get user's unread notifications
     */
    async unread({ params, request, response }: HttpContext) {
        try {
            const page = request.input('page', 1)
            const limit = request.input('limit', 10)

            const unreadNotifications = await Notification.query()
                .where('user_id', params.userId)
                .where('is_read', false)
                .orderBy('created_at', 'desc')
                .paginate(page, limit)

            return response.status(200).json({
                success: true,
                data: unreadNotifications,
                message: 'Unread notifications retrieved successfully'
            })

        } catch (error) {
            console.error('Unread notifications error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving unread notifications'
            })
        }
    }

    /**
     * Get user's notification count
     */
    async count({ params, response }: HttpContext) {
        try {
            const totalCount = await Notification.query()
                .where('user_id', params.userId)
                .count('* as total')

            const unreadCount = await Notification.query()
                .where('user_id', params.userId)
                .where('is_read', false)
                .count('* as total')

            const count = {
                total: totalCount[0].$extras.total,
                unread: unreadCount[0].$extras.total,
                read: totalCount[0].$extras.total - unreadCount[0].$extras.total
            }

            return response.status(200).json({
                success: true,
                data: count,
                message: 'Notification count retrieved successfully'
            })

        } catch (error) {
            console.error('Notification count error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving notification count'
            })
        }
    }

    /**
     * Send bulk notifications
     */
    async sendBulk({ request, response }: HttpContext) {
        try {
            const userIds = request.input('userIds', [])
            const type = request.input('type')
            const title = request.input('title')
            const message = request.input('message')
            const priority = request.input('priority', 'normal')
            const data = request.input('data', {})
            const actionUrl = request.input('actionUrl')

            if (!userIds.length || !type || !title || !message) {
                return response.status(400).json({
                    success: false,
                    message: 'User IDs, type, title, and message are required'
                })
            }

            const notifications = []
            for (const userId of userIds) {
                const notification = new Notification()
                notification.id = uuid()
                notification.userId = userId
                notification.type = type
                notification.title = title
                notification.message = message
                notification.priority = priority
                notification.isRead = false
                notification.data = data
                notification.actionUrl = actionUrl

                notifications.push(notification)
            }

            await Notification.createMany(notifications)

            return response.status(201).json({
                success: true,
                data: { count: notifications.length },
                message: `${notifications.length} notifications sent successfully`
            })

        } catch (error) {
            console.error('Send bulk notifications error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while sending bulk notifications'
            })
        }
    }

    /**
     * Delete expired notifications
     */
    async deleteExpired({ response }: HttpContext) {
        try {
            const deletedCount = await Notification.query()
                .where('expires_at', '<', DateTime.now().toSQL()!)
                .delete()

            return response.status(200).json({
                success: true,
                data: { deletedCount },
                message: `${deletedCount} expired notifications deleted`
            })

        } catch (error) {
            console.error('Delete expired notifications error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while deleting expired notifications'
            })
        }
    }

    /**
     * Get notification summary/statistics
     */
    async summary({ response }: HttpContext) {
        try {
            const totalNotifications = await Notification.query().count('* as total')
            const unreadNotifications = await Notification.query()
                .where('is_read', false)
                .count('* as total')
            const urgentNotifications = await Notification.query()
                .where('priority', 'high')
                .count('* as total')
            const todayNotifications = await Notification.query()
                .whereRaw('DATE(created_at) = CURDATE()')
                .count('* as total')

            const summary = {
                totalNotifications: totalNotifications[0].$extras.total,
                unreadNotifications: unreadNotifications[0].$extras.total,
                urgentNotifications: urgentNotifications[0].$extras.total,
                todayNotifications: todayNotifications[0].$extras.total,
                readRate: totalNotifications[0].$extras.total > 0
                    ? (((totalNotifications[0].$extras.total - unreadNotifications[0].$extras.total) / totalNotifications[0].$extras.total) * 100).toFixed(2)
                    : 0
            }

            return response.status(200).json({
                success: true,
                data: summary,
                message: 'Notification summary retrieved successfully'
            })

        } catch (error) {
            console.error('Notification summary error:', error)
            return response.status(500).json({
                success: false,
                message: 'Server error while retrieving notification summary'
            })
        }
    }
}