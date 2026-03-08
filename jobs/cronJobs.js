const cron = require('node-cron');
const User = require('../models/User');
const Streak = require('../models/Streak');
const sendPushNotification = require('../utils/sendPushNotification');

/**
 * Daily Jobs:
 * 1. 00:05 — Reset streaks where the user didn't hit their goal yesterday
 * 2. Based on each user's reminder settings — send hydration reminders
 *    (simplified: runs every hour and checks whose reminder window applies)
 */

// ─── Midnight streak reset ───────────────────────────────────────────────────
cron.schedule('5 0 * * *', async () => {
    console.log('⏰ Running daily streak reset...');
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        // Find streaks where lastCompletedDate is before yesterday → gap → reset
        const result = await Streak.updateMany(
            { lastCompletedDate: { $lt: yesterday } },
            { $set: { currentStreak: 0 } }
        );
        console.log(`✅ Reset ${result.modifiedCount} user streak(s).`);
    } catch (err) {
        console.error('Streak reset error:', err.message);
    }
});

// ─── Hourly reminder sender ──────────────────────────────────────────────────
cron.schedule('0 * * * *', async () => {
    const now = new Date();
    const hour = now.getHours();
    const min = now.getMinutes();
    const currentTime = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;

    try {
        // Get users with reminders enabled and a push token
        const users = await User.find({ remindersEnabled: true, expoPushToken: { $ne: null } });

        for (const user of users) {
            const start = user.reminderStartTime || '08:00';
            const end = user.reminderEndTime || '22:00';

            if (currentTime >= start && currentTime <= end) {
                await sendPushNotification(
                    user,
                    '💧 Hydration Reminder',
                    "It's time to drink some water! Stay on track with your goal.",
                    'reminder'
                );
            }
        }
        console.log(`✅ Hourly reminders sent at ${currentTime}`);
    } catch (err) {
        console.error('Reminder job error:', err.message);
    }
});

console.log('🕐 Cron jobs initialized.');
