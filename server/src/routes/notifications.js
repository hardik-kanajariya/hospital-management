import express from 'express';
import crypto from 'crypto';
import { db } from '../config/database.js';
import { sendResponse, sendError } from '../utils/response.js';

const router = express.Router();

// Get all notifications
router.get('/', async (req, res) => {
    try {
        const { user } = req;
        let query = 'SELECT * FROM notifications';
        let params = [];

        // Filter notifications based on user role
        if (user.role !== 'super_admin' && user.role !== 'admin') {
            query += ' WHERE user_id = ?';
            params = [user.id];
        }

        query += ' ORDER BY created_at DESC';

        const notifications = await db.query(query, params);

        // Transform the data to match frontend expectations
        const transformedNotifications = notifications.map(notification => ({
            id: notification.id,
            type: notification.type || 'in_app',
            recipientId: notification.user_id || notification.patient_id,
            recipientType: notification.user_id ? 'staff' : 'patient',
            subject: notification.title,
            message: notification.message,
            scheduledAt: notification.created_at,
            sentAt: notification.created_at,
            status: notification.is_read ? 'delivered' : 'sent',
            templateType: notification.data?.templateType || 'custom'
        }));

        sendResponse(res, transformedNotifications, 'Notifications retrieved successfully');
    } catch (error) {
        console.error('Error fetching notifications:', error);
        sendError(res, 'Failed to fetch notifications', 500);
    }
});

// Get notification by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { user } = req;

        let query = 'SELECT * FROM notifications WHERE id = ?';
        let params = [id];

        // Add permission check for non-admin users
        if (user.role !== 'super_admin' && user.role !== 'admin') {
            query += ' AND user_id = ?';
            params.push(user.id);
        }

        const [notification] = await db.query(query, params);

        if (!notification) {
            return sendError(res, 'Notification not found', 404);
        }

        // Transform the data to match frontend expectations
        const transformedNotification = {
            id: notification.id,
            type: notification.type || 'in_app',
            recipientId: notification.user_id || notification.patient_id,
            recipientType: notification.user_id ? 'staff' : 'patient',
            subject: notification.title,
            message: notification.message,
            scheduledAt: notification.created_at,
            sentAt: notification.created_at,
            status: notification.is_read ? 'delivered' : 'sent',
            templateType: notification.data?.templateType || 'custom'
        };

        sendResponse(res, transformedNotification, 'Notification retrieved successfully');
    } catch (error) {
        console.error('Error fetching notification:', error);
        sendError(res, 'Failed to fetch notification', 500);
    }
});

// Create new notification
router.post('/', async (req, res) => {
    try {
        const {
            type,
            recipientId,
            recipientType,
            subject,
            message,
            templateType
        } = req.body;

        // Validate required fields
        if (!recipientId || !subject || !message) {
            return sendError(res, 'Missing required fields: recipientId, subject, message', 400);
        }

        // Validate type
        const validTypes = ['sms', 'email', 'in_app'];
        if (type && !validTypes.includes(type)) {
            return sendError(res, 'Invalid notification type', 400);
        }

        // Validate recipientType
        const validRecipientTypes = ['patient', 'doctor', 'staff'];
        if (recipientType && !validRecipientTypes.includes(recipientType)) {
            return sendError(res, 'Invalid recipient type', 400);
        }

        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        // Map recipient based on type
        const userId = recipientType === 'staff' || recipientType === 'doctor' ? recipientId : null;
        const patientId = recipientType === 'patient' ? recipientId : null;

        const query = `
      INSERT INTO notifications (
        id, user_id, patient_id, type, title, message, 
        is_read, data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const data = {
            templateType: templateType || 'custom',
            originalType: type || 'in_app'
        };

        await db.query(query, [
            id, userId, patientId, type || 'in_app', subject, message,
            false, JSON.stringify(data), createdAt
        ]);

        const newNotification = {
            id,
            type: type || 'in_app',
            recipientId,
            recipientType: recipientType || 'staff',
            subject,
            message,
            scheduledAt: createdAt,
            sentAt: createdAt,
            status: 'sent',
            templateType: templateType || 'custom'
        };

        sendResponse(res, newNotification, 'Notification created successfully', 201);
    } catch (error) {
        console.error('Error creating notification:', error);
        sendError(res, 'Failed to create notification', 500);
    }
});

// Update notification (mainly for marking as read)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { user } = req;
        const { is_read } = req.body;

        // Check if notification exists and user has permission
        let checkQuery = 'SELECT * FROM notifications WHERE id = ?';
        let checkParams = [id];

        if (user.role !== 'super_admin' && user.role !== 'admin') {
            checkQuery += ' AND user_id = ?';
            checkParams.push(user.id);
        }

        const [existingNotification] = await db.query(checkQuery, checkParams);

        if (!existingNotification) {
            return sendError(res, 'Notification not found', 404);
        }

        // Update notification
        const updateQuery = `
      UPDATE notifications 
      SET is_read = ?, read_at = ? 
      WHERE id = ?
    `;

        const readAt = is_read ? new Date().toISOString() : null;
        await db.query(updateQuery, [is_read || false, readAt, id]);

        // Fetch and return updated notification
        const [updatedNotification] = await db.query('SELECT * FROM notifications WHERE id = ?', [id]);

        const transformedNotification = {
            id: updatedNotification.id,
            type: updatedNotification.type || 'in_app',
            recipientId: updatedNotification.user_id || updatedNotification.patient_id,
            recipientType: updatedNotification.user_id ? 'staff' : 'patient',
            subject: updatedNotification.title,
            message: updatedNotification.message,
            scheduledAt: updatedNotification.created_at,
            sentAt: updatedNotification.created_at,
            status: updatedNotification.is_read ? 'delivered' : 'sent',
            templateType: updatedNotification.data?.templateType || 'custom'
        };

        sendResponse(res, transformedNotification, 'Notification updated successfully');
    } catch (error) {
        console.error('Error updating notification:', error);
        sendError(res, 'Failed to update notification', 500);
    }
});

// Delete notification
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { user } = req;

        // Check if notification exists and user has permission
        if (user.role !== 'super_admin' && user.role !== 'admin') {
            return sendError(res, 'Insufficient permissions to delete notifications', 403);
        }

        const [existingNotification] = await db.query('SELECT * FROM notifications WHERE id = ?', [id]);

        if (!existingNotification) {
            return sendError(res, 'Notification not found', 404);
        }

        await db.query('DELETE FROM notifications WHERE id = ?', [id]);
        sendResponse(res, null, 'Notification deleted successfully');
    } catch (error) {
        console.error('Error deleting notification:', error);
        sendError(res, 'Failed to delete notification', 500);
    }
});

// Get notification statistics
router.get('/stats/summary', async (req, res) => {
    try {
        const { user } = req;

        let baseQuery = `
      SELECT 
        is_read,
        type,
        COUNT(*) as count
      FROM notifications
    `;

        let params = [];

        if (user.role !== 'super_admin' && user.role !== 'admin') {
            baseQuery += ' WHERE user_id = ?';
            params = [user.id];
        }

        baseQuery += ' GROUP BY is_read, type';

        const stats = await db.query(baseQuery, params);

        // Process stats into a more useful format
        const summary = {
            total: 0,
            unread: 0,
            read: 0,
            byType: {}
        };

        stats.forEach(stat => {
            summary.total += stat.count;

            if (stat.is_read) {
                summary.read += stat.count;
            } else {
                summary.unread += stat.count;
            }

            if (!summary.byType[stat.type]) {
                summary.byType[stat.type] = 0;
            }
            summary.byType[stat.type] += stat.count;
        });

        sendResponse(res, summary, 'Notification statistics retrieved successfully');
    } catch (error) {
        console.error('Error fetching notification statistics:', error);
        sendError(res, 'Failed to fetch notification statistics', 500);
    }
});

export default router;
