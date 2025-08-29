import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { sendResponse, sendError } from '../utils/response.js';

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (but should be restricted in production)
router.post('/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
    body('role').isIn(['super_admin', 'doctor', 'billing_manager', 'nurse', 'lab_technician', 'pharmacist', 'medical_store_manager', 'receptionist'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendError(res, 'Validation failed', 400, errors.array());
        }

        const { email, password, name, role, phone, department, employee_id } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return sendError(res, 'User with this email already exists', 400);
        }

        // Create user
        const user = await User.create({
            email,
            password_hash: password, // Will be hashed by the model hook
            name,
            role,
            phone,
            department,
            employee_id
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        sendResponse(res, {
            user,
            token
        }, 'User created successfully', 201);
    } catch (error) {
        console.error('Registration error:', error);
        sendError(res, 'Server error during registration', 500);
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], async (req, res) => {
    try {
        console.log('🔐 Login attempt received:', req.body);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation errors:', errors.array());
            return sendError(res, 'Validation failed', 400, errors.array());
        }

        const { email, password } = req.body;
        console.log('📧 Looking for user with email:', email);

        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('❌ User not found:', email);
            return sendError(res, 'Invalid credentials', 401);
        }

        console.log('✅ User found:', user.email, 'Active:', user.is_active);

        // Check if user is active
        if (!user.is_active) {
            console.log('❌ User account is deactivated');
            return sendError(res, 'Account is deactivated', 401);
        }

        // Verify password
        console.log('🔑 Verifying password...');
        const isMatch = await user.comparePassword(password);
        console.log('🔑 Password match result:', isMatch);

        if (!isMatch) {
            console.log('❌ Password does not match');
            return sendError(res, 'Invalid credentials', 401);
        }

        // Update last login
        await user.update({ last_login: new Date() });

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        console.log('✅ Login successful for user:', user.email);

        // Get permissions for the user's role
        const permissions = User.getPermissionsForRole(user.role);

        sendResponse(res, {
            user: {
                ...user.toJSON(),
                permissions
            },
            token: {
                type: 'Bearer',
                token: token,
                expiresAt: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString() // 24 hours
            }
        }, 'Login successful');
    } catch (error) {
        console.error('❌ Login error:', error);
        sendError(res, 'Server error during login', 500);
    }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return sendError(res, 'Access denied. No token provided.', 401);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user || !user.is_active) {
            return sendError(res, 'User not found or inactive', 401);
        }

        sendResponse(res, { user }, 'User profile retrieved successfully');
    } catch (error) {
        console.error('Get profile error:', error);
        sendError(res, 'Invalid token', 401);
    }
});

// @desc    Logout user (invalidate token on client side)
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', (req, res) => {
    sendResponse(res, null, 'Logout successful');
});

export default router;
