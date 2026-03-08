const HydrationLog = require('../models/HydrationLog');
const { updateStreak } = require('../utils/streakHelper');
const { checkAndAwardBadges } = require('../utils/badgeHelper');

// Helper: Start of a day in UTC
const startOfDay = (date) => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
};
const endOfDay = (date) => {
    const d = new Date(date);
    d.setUTCHours(23, 59, 59, 999);
    return d;
};

// @desc    Log a drink
// @route   POST /api/hydration/log
const logDrink = async (req, res) => {
    try {
        const { amount, drinkType, loggedAt } = req.body;
        if (!amount) return res.status(400).json({ success: false, message: 'Amount is required.' });

        const logDate = loggedAt ? new Date(loggedAt) : new Date();
        const todayStart = startOfDay(new Date());

        if (logDate < todayStart) {
            return res.status(400).json({ success: false, message: 'Cannot log hydration for past dates.' });
        }

        const entry = await HydrationLog.create({
            userId: req.user._id,
            amount,
            drinkType: drinkType || 'Water',
            loggedAt: loggedAt || new Date(),
        });

        // Get today's total
        const today = new Date();
        const total = await HydrationLog.aggregate([
            { $match: { userId: req.user._id, loggedAt: { $gte: startOfDay(today), $lte: endOfDay(today) } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const todayTotal = total[0]?.total || 0;

        // Update streak and badges
        const streak = await updateStreak(req.user, todayTotal);
        const newBadges = await checkAndAwardBadges(req.user);

        res.status(201).json({ success: true, entry, todayTotal, streak, newBadges });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get today's logs + total (or any specific date)
// @route   GET /api/hydration/today?date=2023-10-25
const getToday = async (req, res) => {
    try {
        const targetDate = req.query.date ? new Date(req.query.date) : new Date();
        const logs = await HydrationLog.find({
            userId: req.user._id,
            loggedAt: { $gte: startOfDay(targetDate), $lte: endOfDay(targetDate) }
        }).sort({ loggedAt: -1 });

        const total = logs.reduce((sum, l) => sum + l.amount, 0);
        res.json({ success: true, logs, total, goal: req.user.dailyGoal, date: targetDate });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get history (grouped by date)
// @route   GET /api/hydration/history?page=1&limit=20
const getHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const logs = await HydrationLog.find({ userId: req.user._id })
            .sort({ loggedAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await HydrationLog.countDocuments({ userId: req.user._id });

        // Group by date label
        const grouped = {};
        logs.forEach(log => {
            const dateKey = new Date(log.loggedAt).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
            if (!grouped[dateKey]) grouped[dateKey] = { date: dateKey, data: [] };
            grouped[dateKey].data.push(log);
        });

        res.json({ success: true, groups: Object.values(grouped), total, page, totalPages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Edit a log entry
// @route   PUT /api/hydration/:id
const editLog = async (req, res) => {
    try {
        const { amount, drinkType, loggedAt } = req.body;
        const log = await HydrationLog.findOne({ _id: req.params.id, userId: req.user._id });
        if (!log) return res.status(404).json({ success: false, message: 'Log not found.' });

        if (amount) log.amount = amount;
        if (drinkType) log.drinkType = drinkType;
        if (loggedAt) log.loggedAt = loggedAt;
        await log.save();

        res.json({ success: true, log });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete a log entry
// @route   DELETE /api/hydration/:id
const deleteLog = async (req, res) => {
    try {
        const log = await HydrationLog.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!log) return res.status(404).json({ success: false, message: 'Log not found.' });
        res.json({ success: true, message: 'Log deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { logDrink, getToday, getHistory, editLog, deleteLog };
