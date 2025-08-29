import express from 'express';
import { Notification, User } from '../models/index.js';
import { sendResponse, sendError } from '../utils/response.js';

const router = express.Router();

// Get all notifications
router.get('/', async (req, res) => {
    try {
        const { user } = req;
        const { page = 1, limit = 10, type, is_read } = req.query;

        let whereClause = {};

        // Filter notifications based on user role
        if (user.role !== 'super_admin' && user.role !== 'admin') {
            whereClause.user_id = user.id;
        }

        // Add type filter if provided
        if (type) {
            whereClause.type = type;
        }

        // Add read status filter if provided
        if (is_read !== undefined) {
            whereClause.is_read = is_read === 'true';
        }

        const notifications = await Notification.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'role']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit)
        });

        sendResponse(res, {
            data: notifications.rows,
            total: notifications.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(notifications.count / parseInt(limit))
        }, 'Notifications retrieved successfully');
    } catch (error) {
        console.error('Error fetching notifications:', error);
        sendError(res, 'Failed to fetch notifications', 500);
    }
});

// Get unread notifications count
router.get('/unread-count', async (req, res) => {
    try {
        const { user } = req;

        const count = await Notification.count({
            where: {
                user_id: user.id,
                is_read: false
            }
        });

        sendResponse(res, { count }, 'Unread notifications count retrieved successfully');
    } catch (error) {
        console.error('Error fetching unread notifications count:', error);
        sendError(res, 'Failed to fetch unread notifications count', 500);
    }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        const { user } = req;

        const notification = await Notification.findOne({
            where: {
                id,
                user_id: user.id
            }
        });

        if (!notification) {
            return sendError(res, 'Notification not found', 404);
        }

        await notification.update({
            is_read: true,
            read_at: new Date()
        });

        sendResponse(res, notification, 'Notification marked as read');
    } catch (error) {
        console.error('Error marking notification as read:', error);
        sendError(res, 'Failed to mark notification as read', 500);
    }
});

// Mark all notifications as read
router.patch('/mark-all-read', async (req, res) => {
    try {
        const { user } = req;

        await Notification.update(
            {
                is_read: true,
                read_at: new Date()
            },
            {
                where: {
                    user_id: user.id,
                    is_read: false
                }
            }
        );

        sendResponse(res, {}, 'All notifications marked as read');
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        sendError(res, 'Failed to mark all notifications as read', 500);
    }
});

// Create a new notification
router.post('/', async (req, res) => {
    try {
        const { user } = req;
        const { user_id, title, message, type, priority, data, action_url, expires_at } = req.body;

        // Check if user has permission to create notifications
        if (user.role !== 'super_admin' && user.role !== 'admin') {
            return sendError(res, 'Insufficient permissions to create notifications', 403);
        }

        const notification = await Notification.create({
            user_id,
            title,
            message,
            type: type || 'info',
            priority: priority || 'medium',
            data: data || {},
            action_url,
            expires_at,
            created_by: user.id
        });

        sendResponse(res, notification, 'Notification created successfully', 201);
    } catch (error) {
        console.error('Error creating notification:', error);
        sendError(res, 'Failed to create notification', 500);
    }
});

// Delete a notification
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { user } = req;

        const notification = await Notification.findOne({
            where: {
                id,
                user_id: user.id
            }
        });

        if (!notification) {
            return sendError(res, 'Notification not found', 404);
        }

        await notification.destroy();

        sendResponse(res, {}, 'Notification deleted successfully');
    } catch (error) {
        console.error('Error deleting notification:', error);
        sendError(res, 'Failed to delete notification', 500);
    }
});

export default router;
