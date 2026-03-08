const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { logDrink, getToday, getHistory, editLog, deleteLog } = require('../controllers/hydrationController');

router.use(protect);

router.post('/log', logDrink);
router.get('/today', getToday);
router.get('/history', getHistory);
router.put('/:id', editLog);
router.delete('/:id', deleteLog);

module.exports = router;
