const mongoose = require('mongoose');

// Badge definitions matching the app's 4 badge levels
const BADGE_DEFINITIONS = [
    { id: 1, target: 3, title: 'Hydration Starter', description: 'Complete your daily goal for 3 consecutive days.' },
    { id: 2, target: 7, title: 'Water Warrior', description: 'Complete your daily goal for 7 consecutive days.' },
    { id: 3, target: 30, title: 'Hydro Hero', description: 'Complete your daily goal for 30 consecutive days.' },
    { id: 4, target: 90, title: 'Aqua Master', description: 'Complete your daily goal for 90 consecutive days.' },
];

const badgeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    badgeId: { type: Number, required: true },       // 1-4
    title: { type: String, required: true },
    description: { type: String },
    unlockedAt: { type: Date, default: Date.now },
}, { timestamps: true });

badgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true }); // one badge per user

module.exports = mongoose.model('Badge', badgeSchema);
module.exports.BADGE_DEFINITIONS = BADGE_DEFINITIONS;
