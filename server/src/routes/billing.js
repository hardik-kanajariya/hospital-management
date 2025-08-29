import express from 'express';
import { sendResponse } from '../utils/response.js';

const router = express.Router();

// @desc    Get billing information
// @route   GET /api/billing
// @access  Private
router.get('/', async (req, res) => {
    sendResponse(res, [], 'Billing endpoint - Coming soon');
});

export default router;
