const HydrationLog = require('../models/HydrationLog');

// @desc    Get stats for charts — Weekly / Monthly / Yearly
// @route   GET /api/stats?period=weekly|monthly|yearly
const getStats = async (req, res) => {
    try {
        const period = (req.query.period || 'weekly').toLowerCase();
        const userId = req.user._id;
        const now = new Date();

        let groupFormat, start;

        if (period === 'weekly') {
            // Last 7 days grouped by day
            start = new Date(now);
            start.setDate(start.getDate() - 6);
            start.setHours(0, 0, 0, 0);
            groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$loggedAt' } };
        } else if (period === 'monthly') {
            // Last 4 weeks grouped by ISO week
            start = new Date(now);
            start.setDate(start.getDate() - 27);
            start.setHours(0, 0, 0, 0);
            groupFormat = { $isoWeek: '$loggedAt' };
        } else {
            // This year grouped by month
            start = new Date(now.getFullYear(), 0, 1);
            groupFormat = { $month: '$loggedAt' };
        }

        // Bar/Line data — intake per period
        const intakeByPeriod = await HydrationLog.aggregate([
            { $match: { userId, loggedAt: { $gte: start, $lte: now } } },
            { $group: { _id: groupFormat, total: { $sum: '$amount' } } },
            { $sort: { _id: 1 } },
        ]);

        // Drink type breakdown — for pie chart
        const drinkBreakdown = await HydrationLog.aggregate([
            { $match: { userId, loggedAt: { $gte: start, $lte: now } } },
            { $group: { _id: '$drinkType', total: { $sum: '$amount' } } },
            { $sort: { total: -1 } },
        ]);

        // Summary totals
        const totalIntake = drinkBreakdown.reduce((sum, d) => sum + d.total, 0);
        const avgPerDay = period === 'weekly'
            ? Math.round(totalIntake / 7)
            : period === 'monthly' ? Math.round(totalIntake / 30)
                : Math.round(totalIntake / 365);

        res.json({
            success: true,
            period,
            intakeByPeriod,
            drinkBreakdown,
            summary: { totalIntake, avgPerDay, goal: req.user.dailyGoal },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getStats };
