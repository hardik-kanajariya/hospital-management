import express from 'express';

const router = express.Router();

// @desc    Get inventory
// @route   GET /api/inventory
// @access  Private
router.get('/', async (req, res) => {
    res.json({
        success: true,
        message: 'Inventory endpoint - Coming soon',
        data: []
    });
});

export default router;
