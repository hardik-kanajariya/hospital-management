import express from 'express';
import { sendResponse } from '../utils/response.js';

const router = express.Router();

// @desc    Get bed information
// @route   GET /api/beds
// @access  Private
router.get('/', async (req, res) => {
    sendResponse(res, [], 'Beds endpoint - Coming soon');
});

export default router;
