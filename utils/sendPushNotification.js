const { Expo } = require('expo-server-sdk');
const Notification = require('../models/Notification');

const expo = new Expo();

/**
 * Send a push notification to a user's device and save it to DB
 * @param {Object} user - User document with expoPushToken
 * @param {string} title
 * @param {string} body
 * @param {string} type - 'reminder' | 'goal' | 'achievement'
 */
const sendPushNotification = async (user, title, body, type = 'reminder') => {
    // Save to DB regardless of push success
    await Notification.create({ userId: user._id, title, message: body, type });

    if (!user.expoPushToken || !Expo.isExpoPushToken(user.expoPushToken)) return;

    const message = {
        to: user.expoPushToken,
        sound: 'default',
        title,
        body,
        data: { type },
    };

    try {
        const chunks = expo.chunkPushNotifications([message]);
        for (const chunk of chunks) {
            await expo.sendPushNotificationsAsync(chunk);
        }
    } catch (err) {
        console.error('Push notification error:', err.message);
    }
};

module.exports = sendPushNotification;
