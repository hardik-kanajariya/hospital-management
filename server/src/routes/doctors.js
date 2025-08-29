import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { Op } from 'sequelize';
import { Doctor, User, Appointment } from '../models/index.js';
import { sendResponse, sendError } from '../utils/response.js';

const router = express.Router();

// @desc    Get all doctors with filtering and pagination
// @route   GET /api/doctors
// @access  Private
router.get('/', [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().trim(),
    query('specialization').optional().trim(),
    query('is_available').optional().isBoolean()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendError(res, 'Validation failed', 400, errors.array());
        }

        const {
            page = 1,
            limit = 10,
            search = '',
            specialization,
            is_available
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        let whereClause = {};

        // Add filters
        if (specialization) {
            whereClause.specialization = { [Op.like]: `%${specialization}%` };
        }
        if (is_available !== undefined) {
            whereClause.is_available = is_available === 'true';
        }

        // Include user data and search in user name/email
        const includeClause = [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone', 'department'],
            where: search ? {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
                ]
            } : undefined
        }];

        const doctors = await Doctor.findAndCountAll({
            where: whereClause,
            include: includeClause,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        sendResponse(res, {
            data: doctors.rows,
            total: doctors.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(doctors.count / parseInt(limit))
        }, 'Doctors retrieved successfully');

    } catch (error) {
        console.error('Error fetching doctors:', error);
        sendError(res, 'Failed to fetch doctors', 500);
    }
});

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const doctor = await Doctor.findByPk(id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email', 'phone', 'department']
            }]
        });

        if (!doctor) {
            return sendError(res, 'Doctor not found', 404);
        }

        // Get recent appointments count
        const appointmentsCount = await Appointment.count({
            where: {
                doctor_id: id,
                status: { [Op.notIn]: ['cancelled'] }
            }
        });

        const doctorData = doctor.toJSON();
        doctorData.appointments_count = appointmentsCount;

        sendResponse(res, doctorData, 'Doctor retrieved successfully');
    } catch (error) {
        console.error('Error fetching doctor:', error);
        sendError(res, 'Failed to fetch doctor', 500);
    }
});

// @desc    Create new doctor profile
// @route   POST /api/doctors
// @access  Private (Admin only)
router.post('/', [
    body('user_id').isUUID().withMessage('Valid user ID is required'),
    body('medical_license').trim().notEmpty().withMessage('Medical license is required'),
    body('specialization').trim().notEmpty().withMessage('Specialization is required'),
    body('qualification').trim().notEmpty().withMessage('Qualification is required'),
    body('experience_years').isInt({ min: 0 }).withMessage('Experience years must be a non-negative integer'),
    body('consultation_fee').isFloat({ min: 0 }).withMessage('Consultation fee must be a positive number'),
    body('working_hours').optional().isObject(),
    body('available_days').optional().isArray(),
    body('room_number').optional().trim(),
    body('bio').optional().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendError(res, 'Validation failed', 400, errors.array());
        }

        const { user } = req;

        // Check if user has admin privileges
        if (user.role !== 'super_admin' && user.role !== 'admin') {
            return sendError(res, 'Access denied. Admin privileges required.', 403);
        }

        const {
            user_id,
            medical_license,
            specialization,
            qualification,
            experience_years,
            consultation_fee,
            working_hours = {},
            available_days = [],
            room_number,
            bio
        } = req.body;

        // Verify user exists and has doctor role
        const userRecord = await User.findByPk(user_id);
        if (!userRecord) {
            return sendError(res, 'User not found', 404);
        }

        if (userRecord.role !== 'doctor') {
            return sendError(res, 'User must have doctor role', 400);
        }

        // Check if doctor profile already exists
        const existingDoctor = await Doctor.findOne({ where: { user_id } });
        if (existingDoctor) {
            return sendError(res, 'Doctor profile already exists for this user', 409);
        }

        // Check if medical license is unique
        const existingLicense = await Doctor.findOne({ where: { medical_license } });
        if (existingLicense) {
            return sendError(res, 'Medical license already exists', 409);
        }

        const doctor = await Doctor.create({
            user_id,
            medical_license,
            specialization,
            qualification,
            experience_years,
            consultation_fee,
            working_hours,
            available_days,
            room_number,
            bio
        });

        const completeDoctor = await Doctor.findByPk(doctor.id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email', 'phone', 'department']
            }]
        });

        sendResponse(res, completeDoctor, 'Doctor profile created successfully', 201);
    } catch (error) {
        console.error('Error creating doctor:', error);
        sendError(res, 'Failed to create doctor profile', 500);
    }
});

// @desc    Update doctor profile
// @route   PUT /api/doctors/:id
// @access  Private
router.put('/:id', [
    body('medical_license').optional().trim().notEmpty(),
    body('specialization').optional().trim().notEmpty(),
    body('qualification').optional().trim().notEmpty(),
    body('experience_years').optional().isInt({ min: 0 }),
    body('consultation_fee').optional().isFloat({ min: 0 }),
    body('working_hours').optional().isObject(),
    body('available_days').optional().isArray(),
    body('room_number').optional().trim(),
    body('is_available').optional().isBoolean(),
    body('bio').optional().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendError(res, 'Validation failed', 400, errors.array());
        }

        const { id } = req.params;
        const { user } = req;

        const doctor = await Doctor.findByPk(id);
        if (!doctor) {
            return sendError(res, 'Doctor not found', 404);
        }

        // Check permissions - doctors can update their own profile, admins can update any
        if (user.role !== 'super_admin' && user.role !== 'admin') {
            if (user.role === 'doctor' && doctor.user_id !== user.id) {
                return sendError(res, 'Access denied', 403);
            }
        }

        const allowedUpdates = [
            'medical_license', 'specialization', 'qualification', 'experience_years',
            'consultation_fee', 'working_hours', 'available_days', 'room_number',
            'is_available', 'bio'
        ];

        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        // Check if medical license is unique (if being updated)
        if (updates.medical_license && updates.medical_license !== doctor.medical_license) {
            const existingLicense = await Doctor.findOne({
                where: {
                    medical_license: updates.medical_license,
                    id: { [Op.ne]: id }
                }
            });
            if (existingLicense) {
                return sendError(res, 'Medical license already exists', 409);
            }
        }

        await doctor.update(updates);

        const updatedDoctor = await Doctor.findByPk(id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email', 'phone', 'department']
            }]
        });

        sendResponse(res, updatedDoctor, 'Doctor profile updated successfully');
    } catch (error) {
        console.error('Error updating doctor:', error);
        sendError(res, 'Failed to update doctor profile', 500);
    }
});

// @desc    Get doctor's schedule for a date range
// @route   GET /api/doctors/:id/schedule
// @access  Private
router.get('/:id/schedule', [
    query('date_from').isISO8601().withMessage('Valid start date is required'),
    query('date_to').isISO8601().withMessage('Valid end date is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendError(res, 'Validation failed', 400, errors.array());
        }

        const { id } = req.params;
        const { date_from, date_to } = req.query;

        const doctor = await Doctor.findByPk(id);
        if (!doctor) {
            return sendError(res, 'Doctor not found', 404);
        }

        const appointments = await Appointment.findAll({
            where: {
                doctor_id: id,
                appointment_date: {
                    [Op.between]: [new Date(date_from), new Date(date_to)]
                },
                status: { [Op.notIn]: ['cancelled'] }
            },
            include: [{
                model: Patient,
                as: 'patient',
                attributes: ['id', 'patient_id', 'name', 'phone']
            }],
            order: [['appointment_date', 'ASC']]
        });

        sendResponse(res, {
            doctor_id: id,
            date_range: { from: date_from, to: date_to },
            working_hours: doctor.working_hours,
            available_days: doctor.available_days,
            appointments
        }, 'Doctor schedule retrieved successfully');

    } catch (error) {
        console.error('Error fetching doctor schedule:', error);
        sendError(res, 'Failed to fetch doctor schedule', 500);
    }
});

export default router;
