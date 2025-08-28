import express from 'express';

const router = express.Router();

// @desc    Get bed information
// @route   GET /api/beds
// @access  Private
router.get('/', async (req, res) => {
    res.json({
        success: true,
        message: 'Beds endpoint - Coming soon',
        data: []
    });
});

export default router;
