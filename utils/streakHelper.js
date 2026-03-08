const Streak = require('../models/Streak');
const sendPushNotification = require('./sendPushNotification');

/**
 * Update a user's streak after logging hydration.
 * Called whenever a user logs a drink and their total >= dailyGoal.
 */
const updateStreak = async (user, todayTotal) => {
    const { dailyGoal } = user;
    let streak = await Streak.findOne({ userId: user._id });
    if (!streak) {
        streak = await Streak.create({ userId: user._id });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastDate = streak.lastCompletedDate ? new Date(streak.lastCompletedDate) : null;
    if (lastDate) lastDate.setHours(0, 0, 0, 0);

    const alreadyCountedToday = lastDate && lastDate.getTime() === today.getTime();

    if (todayTotal >= dailyGoal && !alreadyCountedToday) {
        // Extend or start streak
        if (lastDate && lastDate.getTime() === yesterday.getTime()) {
            streak.currentStreak += 1;
        } else {
            // Gap detected — restart streak
            streak.currentStreak = 1;
        }
        streak.lastCompletedDate = today;
        streak.totalDaysCompleted += 1;

        if (streak.currentStreak > streak.longestStreak) {
            streak.longestStreak = streak.currentStreak;
        }

        await streak.save();

        // Notify goal reached
        await sendPushNotification(user,
            '🎯 Goal Reached!',
            `Awesome! You've hit your ${dailyGoal}ml goal today. Streak: ${streak.currentStreak} days!`,
            'goal'
        );
    }

    return streak;
};

module.exports = { updateStreak };
