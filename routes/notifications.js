const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getNotifications, markAllRead, clearAll, sendTest } = require('../controllers/notificationController');

router.use(protect);

router.get('/', getNotifications);
router.put('/read-all', markAllRead);
router.delete('/', clearAll);
router.post('/test', sendTest);

module.exports = router;
