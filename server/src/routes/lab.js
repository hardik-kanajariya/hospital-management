import express from 'express';
import { sendResponse } from '../utils/response.js';

const router = express.Router();

// @desc    Get lab tests
// @route   GET /api/lab
// @access  Private
router.get('/', async (req, res) => {
    sendResponse(res, [], 'Lab endpoint - Coming soon');
});

export default router;
