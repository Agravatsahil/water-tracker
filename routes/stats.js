const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getStats } = require('../controllers/statsController');

router.use(protect);

// GET /api/stats?period=weekly|monthly|yearly
router.get('/', getStats);

module.exports = router;
