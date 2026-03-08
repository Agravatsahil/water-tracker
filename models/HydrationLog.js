const mongoose = require('mongoose');

const hydrationLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true }, // ml
    drinkType: {
        type: String,
        enum: ['Water', 'Tea', 'Juice', 'Coffee', 'Soda', 'Other'],
        default: 'Water'
    },
    loggedAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

// Index for fast date-range queries per user
hydrationLogSchema.index({ userId: 1, loggedAt: -1 });

module.exports = mongoose.model('HydrationLog', hydrationLogSchema);
