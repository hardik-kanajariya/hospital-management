import express from 'express';

const router = express.Router();

// @desc    Get billing information
// @route   GET /api/billing
// @access  Private
router.get('/', async (req, res) => {
  res.json({
    success: true,
    message: 'Billing endpoint - Coming soon',
    data: []
  });
});

export default router;
