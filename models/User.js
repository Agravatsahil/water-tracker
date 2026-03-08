const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null }, // null for social logins

    authProvider: { type: String, enum: ['local'], default: 'local' },
    providerId: { type: String, default: null }, // OAuth UID

    avatar: { type: String, default: null }, // URL to avatar image

    // Personal Details
    height: { type: Number, default: 170 },
    weight: { type: Number, default: 70 },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    dailyGoal: { type: Number, default: 2500 }, // ml

    // Reminder Settings
    reminderInterval: { type: Number, default: 60 }, // minutes
    nightDuration: { type: Number, default: 8 }, // hours
    reminderStartTime: { type: String, default: '08:00' },
    reminderEndTime: { type: String, default: '22:00' },
    remindersEnabled: { type: Boolean, default: true },

    // Expo push notification token
    expoPushToken: { type: String, default: null },

    // Refresh token for JWT
    refreshToken: { type: String, default: null },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
