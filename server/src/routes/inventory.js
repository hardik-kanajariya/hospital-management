import express from 'express';
import { sendResponse } from '../utils/response.js';

const router = express.Router();

// @desc    Get inventory
// @route   GET /api/inventory
// @access  Private
router.get('/', async (req, res) => {
    sendResponse(res, [], 'Inventory endpoint - Coming soon');
});

export default router;
