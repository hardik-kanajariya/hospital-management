import express from 'express';

const router = express.Router();

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Private
router.get('/', async (req, res) => {
    res.json({
        success: true,
        message: 'Doctors endpoint - Coming soon',
        data: []
    });
});

export default router;
