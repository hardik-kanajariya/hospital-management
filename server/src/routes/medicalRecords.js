import express from 'express';
import { sendResponse } from '../utils/response.js';

const router = express.Router();

// @desc    Get medical records
// @route   GET /api/medical-records
// @access  Private
router.get('/', async (req, res) => {
    sendResponse(res, [], 'Medical records endpoint - Coming soon');
});

export default router;
