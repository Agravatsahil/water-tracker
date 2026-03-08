const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastCompletedDate: { type: Date, default: null }, // date when goal was last met
    totalDaysCompleted: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Streak', streakSchema);
