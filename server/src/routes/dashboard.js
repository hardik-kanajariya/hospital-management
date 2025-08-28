import express from 'express';

const router = express.Router();

// @desc    Get dashboard data
// @route   GET /api/dashboard
// @access  Private
router.get('/', async (req, res) => {
  res.json({
    success: true,
    message: 'Dashboard endpoint - Coming soon',
    data: {
      stats: {
        total_patients: 0,
        total_appointments: 0,
        available_beds: 0,
        pending_lab_results: 0
      }
    }
  });
});

export default router;
