const Notification = require('../models/Notification');
const sendPushNotification = require('../utils/sendPushNotification');

// @desc    Get all notifications for user (newest first)
// @route   GET /api/notifications?page=1&limit=20
const getNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ sentAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

        res.json({ success: true, notifications, unreadCount });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
        res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Clear all notifications
// @route   DELETE /api/notifications
const clearAll = async (req, res) => {
    try {
        await Notification.deleteMany({ userId: req.user._id });
        res.json({ success: true, message: 'All notifications cleared.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Send a test notification (dev only)
// @route   POST /api/notifications/test
const sendTest = async (req, res) => {
    try {
        await sendPushNotification(req.user, '💧 Hydration Reminder', "Don't forget to drink water! Stay hydrated.", 'reminder');
        res.json({ success: true, message: 'Test notification sent.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getNotifications, markAllRead, clearAll, sendTest };
