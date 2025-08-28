import express from 'express';

const router = express.Router();

// @desc    Get medical records
// @route   GET /api/medical-records
// @access  Private
router.get('/', async (req, res) => {
    res.json({
        success: true,
        message: 'Medical records endpoint - Coming soon',
        data: []
    });
});

export default router;
