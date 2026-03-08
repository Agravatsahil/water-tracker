const Badge = require('../models/Badge');
const Streak = require('../models/Streak');
const { BADGE_DEFINITIONS } = require('../models/Badge');
const sendPushNotification = require('./sendPushNotification');

/**
 * Check and award any badges the user has earned based on their longest streak.
 * Called after every streak update.
 */
const checkAndAwardBadges = async (user) => {
    const streak = await Streak.findOne({ userId: user._id });
    if (!streak) return [];

    const awarded = [];

    for (const badge of BADGE_DEFINITIONS) {
        if (streak.longestStreak >= badge.target) {
            const exists = await Badge.findOne({ userId: user._id, badgeId: badge.id });
            if (!exists) {
                await Badge.create({
                    userId: user._id,
                    badgeId: badge.id,
                    title: badge.title,
                    description: badge.description,
                });
                awarded.push(badge);

                // Send push for new badge
                await sendPushNotification(user,
                    '🏆 New Badge Unlocked!',
                    `You earned "${badge.title}"! Keep up the great work!`,
                    'achievement'
                );
            }
        }
    }

    return awarded;
};

module.exports = { checkAndAwardBadges };
