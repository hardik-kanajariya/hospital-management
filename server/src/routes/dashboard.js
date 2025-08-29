import express from 'express';
import { sendResponse } from '../utils/response.js';

const router = express.Router();

// @desc    Get dashboard data
// @route   GET /api/dashboard
// @access  Private
router.get('/', async (req, res) => {
    sendResponse(res, {
        stats: {
            total_patients: 0,
            total_appointments: 0,
            available_beds: 0,
            pending_lab_results: 0
        }
    }, 'Dashboard endpoint - Coming soon');
});

export default router;
