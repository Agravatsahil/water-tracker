const Streak = require('../models/Streak');
const Badge = require('../models/Badge');
const { BADGE_DEFINITIONS } = require('../models/Badge');

// @desc    Get streak info
// @route   GET /api/streak
const getStreak = async (req, res) => {
    try {
        let streak = await Streak.findOne({ userId: req.user._id });
        if (!streak) streak = await Streak.create({ userId: req.user._id });
        res.json({ success: true, streak });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all earned badges
// @route   GET /api/badge
const getBadges = async (req, res) => {
    try {
        const earned = await Badge.find({ userId: req.user._id }).sort({ badgeId: 1 });
        const streak = await Streak.findOne({ userId: req.user._id });

        // Return all badge definitions with earned status
        const badges = BADGE_DEFINITIONS.map(def => {
            const earnedBadge = earned.find(b => b.badgeId === def.id);
            return {
                ...def,
                earned: !!earnedBadge,
                unlockedAt: earnedBadge?.unlockedAt || null,
                progress: Math.min(streak?.longestStreak || 0, def.target),
            };
        });

        res.json({ success: true, badges, currentStreak: streak?.currentStreak || 0, longestStreak: streak?.longestStreak || 0 });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getStreak, getBadges };
