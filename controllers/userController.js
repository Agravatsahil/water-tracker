const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/user/me
const getMe = async (req, res) => {
    res.json({ success: true, user: req.user });
};

// @desc    Update profile (name, email, height, weight, gender, dailyGoal)
// @route   PUT /api/user/me
const updateMe = async (req, res) => {
    try {
        const { name, email, height, weight, gender, dailyGoal } = req.body;
        const updates = {};
        if (name) updates.name = name;
        if (email) updates.email = email;
        if (height) updates.height = height;
        if (weight) updates.weight = weight;
        if (gender) updates.gender = gender;
        if (dailyGoal) updates.dailyGoal = dailyGoal;

        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
            .select('-passwordHash -refreshToken');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Change password
// @route   PUT /api/user/password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (user.passwordHash) {
            const match = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!match) return res.status(400).json({ success: false, message: 'Current password incorrect.' });
        }

        user.passwordHash = await bcrypt.hash(newPassword, 12);
        await user.save();
        res.json({ success: true, message: 'Password updated.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update reminder & app settings
// @route   PUT /api/user/settings
const updateSettings = async (req, res) => {
    try {
        const { reminderInterval, nightDuration, reminderStartTime, reminderEndTime, remindersEnabled, expoPushToken } = req.body;
        const updates = {};
        if (reminderInterval !== undefined) updates.reminderInterval = reminderInterval;
        if (nightDuration !== undefined) updates.nightDuration = nightDuration;
        if (reminderStartTime !== undefined) updates.reminderStartTime = reminderStartTime;
        if (reminderEndTime !== undefined) updates.reminderEndTime = reminderEndTime;
        if (remindersEnabled !== undefined) updates.remindersEnabled = remindersEnabled;
        if (expoPushToken !== undefined) updates.expoPushToken = expoPushToken;

        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
            .select('-passwordHash -refreshToken');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getMe, updateMe, changePassword, updateSettings };
