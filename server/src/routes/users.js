import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { Op } from 'sequelize';
import User from '../models/User.js';
import { roleMiddleware } from '../middleware/auth.js';
import { sendResponse, sendError } from '../utils/response.js';

const router = express.Router();

// @desc    Get all users with pagination and search
// @route   GET /api/users
// @access  Private (admin, super_admin)
router.get('/', [
    roleMiddleware('admin', 'super_admin'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().trim(),
    query('role').optional().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendError(res, 'Validation failed', 400, errors.array());
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const role = req.query.role || '';
        const offset = (page - 1) * limit;

        // Build search condition
        const whereCondition = {};

        if (search) {
            whereCondition[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { employee_id: { [Op.like]: `%${search}%` } }
            ];
        }

        if (role) {
            whereCondition.role = role;
        }

        const { count, rows: users } = await User.findAndCountAll({
            where: whereCondition,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        const paginatedResponse = {
            data: users,
            total: count,
            page: page,
            limit: limit,
            totalPages: Math.ceil(count / limit)
        };

        sendResponse(res, paginatedResponse, 'Users retrieved successfully');
    } catch (error) {
        console.error('Get users error:', error);
        sendError(res, 'Server error while fetching users', 500);
    }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (admin, super_admin)
router.put('/:id', [
    roleMiddleware('admin', 'super_admin'),
    body('name').optional().trim().notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().trim(),
    body('department').optional().trim(),
    body('is_active').optional().isBoolean()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendError(res, 'Validation failed', 400, errors.array());
        }

        const user = await User.findByPk(req.params.id);

        if (!user) {
            return sendError(res, 'User not found', 404);
        }

        // Don't allow updating sensitive fields
        const { password_hash, role, permissions, ...updateData } = req.body;

        await user.update(updateData);

        sendResponse(res, user, 'User updated successfully');
    } catch (error) {
        console.error('Update user error:', error);
        sendError(res, 'Server error while updating user', 500);
    }
});

export default router;
