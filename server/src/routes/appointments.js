import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { Op } from 'sequelize';
import { Appointment, Patient, Doctor, User } from '../models/index.js';
import { sendResponse, sendError } from '../utils/response.js';

const router = express.Router();

// @desc    Get all appointments with filtering and pagination
// @route   GET /api/appointments
// @access  Private
router.get('/', [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().trim(),
    query('status').optional().isIn(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
    query('date_from').optional().isISO8601(),
    query('date_to').optional().isISO8601(),
    query('doctor_id').optional().isUUID(),
    query('patient_id').optional().isUUID()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendError(res, 'Validation failed', 400, errors.array());
        }

        const { user } = req;
        const {
            page = 1,
            limit = 10,
            search = '',
            status,
            date_from,
            date_to,
            doctor_id,
            patient_id
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        let whereClause = {};

        // Role-based filtering
        if (user.role === 'doctor') {
            // Doctors can only see their own appointments
            const doctorProfile = await Doctor.findOne({ where: { user_id: user.id } });
            if (doctorProfile) {
                whereClause.doctor_id = doctorProfile.id;
            }
        }

        // Add filters
        if (status) whereClause.status = status;
        if (doctor_id) whereClause.doctor_id = doctor_id;
        if (patient_id) whereClause.patient_id = patient_id;

        // Date range filter
        if (date_from || date_to) {
            whereClause.appointment_date = {};
            if (date_from) whereClause.appointment_date[Op.gte] = new Date(date_from);
            if (date_to) whereClause.appointment_date[Op.lte] = new Date(date_to);
        }

        // Search functionality
        const includeClause = [
            {
                model: Patient,
                as: 'patient',
                attributes: ['id', 'patient_id', 'name', 'phone', 'email'],
                where: search ? {
                    [Op.or]: [
                        { name: { [Op.like]: `%${search}%` } },
                        { patient_id: { [Op.like]: `%${search}%` } },
                        { phone: { [Op.like]: `%${search}%` } }
                    ]
                } : undefined
            },
            {
                model: Doctor,
                as: 'doctor',
                attributes: ['id', 'medical_license', 'specialization'],
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                }]
            }
        ];

        const appointments = await Appointment.findAndCountAll({
            where: whereClause,
            include: includeClause,
            order: [['appointment_date', 'ASC']],
            limit: parseInt(limit),
            offset
        });

        sendResponse(res, {
            data: appointments.rows,
            total: appointments.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(appointments.count / parseInt(limit))
        }, 'Appointments retrieved successfully');

    } catch (error) {
        console.error('Error fetching appointments:', error);
        sendError(res, 'Failed to fetch appointments', 500);
    }
});

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
router.post('/', [
    body('patient_id').isUUID().withMessage('Valid patient ID is required'),
    body('doctor_id').isUUID().withMessage('Valid doctor ID is required'),
    body('appointment_date').isISO8601().withMessage('Valid appointment date is required'),
    body('duration').optional().isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
    body('type').optional().isIn(['consultation', 'follow_up', 'emergency', 'routine_checkup']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'emergency']),
    body('symptoms').optional().trim(),
    body('notes').optional().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendError(res, 'Validation failed', 400, errors.array());
        }

        const { user } = req;
        const {
            patient_id,
            doctor_id,
            appointment_date,
            duration = 30,
            type = 'consultation',
            priority = 'medium',
            symptoms,
            notes
        } = req.body;

        // Verify patient exists
        const patient = await Patient.findByPk(patient_id);
        if (!patient) {
            return sendError(res, 'Patient not found', 404);
        }

        // Verify doctor exists and get consultation fee
        const doctor = await Doctor.findByPk(doctor_id);
        if (!doctor) {
            return sendError(res, 'Doctor not found', 404);
        }

        // Generate appointment ID
        const appointmentCount = await Appointment.count();
        const appointment_id = `APP${String(appointmentCount + 1).padStart(6, '0')}`;

        const appointment = await Appointment.create({
            appointment_id,
            patient_id,
            doctor_id,
            appointment_date: new Date(appointment_date),
            duration,
            type,
            priority,
            symptoms,
            notes,
            consultation_fee: doctor.consultation_fee,
            created_by: user.id
        });

        // Fetch complete appointment data
        const completeAppointment = await Appointment.findByPk(appointment.id, {
            include: [
                {
                    model: Patient,
                    as: 'patient',
                    attributes: ['id', 'patient_id', 'name', 'phone', 'email']
                },
                {
                    model: Doctor,
                    as: 'doctor',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    }]
                }
            ]
        });

        sendResponse(res, completeAppointment, 'Appointment created successfully', 201);
    } catch (error) {
        console.error('Error creating appointment:', error);
        sendError(res, 'Failed to create appointment', 500);
    }
});

export default router;
