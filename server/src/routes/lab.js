import express from 'express';

const router = express.Router();

// @desc    Get lab tests
// @route   GET /api/lab
// @access  Private
router.get('/', async (req, res) => {
  res.json({
    success: true,
    message: 'Lab endpoint - Coming soon',
    data: []
  });
});

export default router;
