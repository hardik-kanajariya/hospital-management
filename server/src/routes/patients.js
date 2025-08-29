import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { Op } from 'sequelize';
import Patient from '../models/Patient.js';
import { roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all patients with pagination and search
// @route   GET /api/patients
// @access  Private
router.get('/', [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        // Build search condition
        const whereCondition = {
            is_active: true
        };

        if (search) {
            whereCondition[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { patient_id: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: patients } = await Patient.findAndCountAll({
            where: whereCondition,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            success: true,
            data: {
                data: patients,
                total: count,
                page: page,
                limit: limit,
                totalPages: totalPages
            }
        });
    } catch (error) {
        console.error('Get patients error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching patients'
        });
    }
});

// @desc    Get single patient by ID
// @route   GET /api/patients/:id
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        res.json({
            success: true,
            data: patient
        });
    } catch (error) {
        console.error('Get patient error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching patient'
        });
    }
});

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private (admin, doctor, nurse, receptionist)
router.post('/', [
    roleMiddleware('admin', 'doctor', 'nurse', 'receptionist'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('date_of_birth').isISO8601().withMessage('Valid date of birth is required'),
    body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('emergency_contact').trim().notEmpty().withMessage('Emergency contact is required'),
    body('email').optional().isEmail().normalizeEmail(),
    body('blood_group').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        // Generate patient ID
        const today = new Date();
        const year = today.getFullYear().toString().slice(-2);
        const month = (today.getMonth() + 1).toString().padStart(2, '0');

        // Get the count of patients created today
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

        const todayCount = await Patient.count({
            where: {
                created_at: {
                    [Op.between]: [todayStart, todayEnd]
                }
            }
        });

        const patientId = `P${year}${month}${(todayCount + 1).toString().padStart(4, '0')}`;

        const patientData = {
            ...req.body,
            patient_id: patientId
        };

        const patient = await Patient.create(patientData);

        res.status(201).json({
            success: true,
            message: 'Patient created successfully',
            data: { patient }
        });
    } catch (error) {
        console.error('Create patient error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating patient'
        });
    }
});

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private (admin, doctor, nurse, receptionist)
router.put('/:id', [
    roleMiddleware('admin', 'doctor', 'nurse', 'receptionist'),
    body('name').optional().trim().notEmpty(),
    body('phone').optional().trim().notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
    body('gender').optional().isIn(['male', 'female', 'other']),
    body('blood_group').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const patient = await Patient.findByPk(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Don't allow updating patient_id
        const { patient_id, ...updateData } = req.body;

        await patient.update(updateData);

        res.json({
            success: true,
            message: 'Patient updated successfully',
            data: { patient }
        });
    } catch (error) {
        console.error('Update patient error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating patient'
        });
    }
});

// @desc    Delete patient (soft delete)
// @route   DELETE /api/patients/:id
// @access  Private (admin only)
router.delete('/:id', roleMiddleware('admin'), async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Soft delete
        await patient.update({ is_active: false });

        res.json({
            success: true,
            message: 'Patient deleted successfully'
        });
    } catch (error) {
        console.error('Delete patient error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting patient'
        });
    }
});

export default router;
