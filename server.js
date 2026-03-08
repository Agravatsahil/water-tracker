require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const hydrationRoutes = require('./routes/hydration');
const statsRoutes = require('./routes/stats');
const gamificationRoutes = require('./routes/gamification');
const notificationRoutes = require('./routes/notifications');

// Cron jobs (auto-starts on require)
require('./jobs/cronJobs');

const app = express();

// ─── Connect DB ──────────────────────────────────────────────────────────────
connectDB();

// ─── Security & logging ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: '*' })); // Restrict to your app domain in production
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Rate limiting ───────────────────────────────────────────────────────────
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased from 100 to 1000 to avoid 429 errors during normal app usage
    message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use('/api', limiter);

// ─── Body parsing ────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/hydration', hydrationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error.' });
});

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 AquaBuddy server running on port ${PORT} in ${process.env.NODE_ENV} mode`));
