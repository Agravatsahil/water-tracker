const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMe, updateMe, changePassword, updateSettings } = require('../controllers/userController');

router.use(protect);

router.get('/me', getMe);
router.put('/me', updateMe);
router.put('/password', changePassword);
router.put('/settings', updateSettings);

module.exports = router;
