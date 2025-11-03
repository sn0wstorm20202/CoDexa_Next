import express from 'express';

const router = express.Router();

// Example route structure
router.get('/', (req, res) => {
  res.json({
    message: 'API Routes',
    availableRoutes: [
      'GET /api',
      'GET /health'
    ]
  });
});

export default router;
