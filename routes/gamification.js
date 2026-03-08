const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getStreak, getBadges } = require('../controllers/streakBadgeController');

router.use(protect);

router.get('/streak', getStreak);
router.get('/badges', getBadges);

module.exports = router;
