import express from 'express';

const router = express.Router();

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
router.get('/', async (req, res) => {
  res.json({
    success: true,
    message: 'Appointments endpoint - Coming soon',
    data: []
  });
});

export default router;
