const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Streak = require('../models/Streak');
const { sendTokenResponse, generateAccessToken, generateRefreshToken } = require('../utils/jwtHelper');

// @desc    Register with email/password
// @route   POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ success: false, message: 'All fields required.' });

        const exists = await User.findOne({ email });
        if (exists)
            return res.status(400).json({ success: false, message: 'Email already registered.' });

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await User.create({ name, email, passwordHash });
        await Streak.create({ userId: user._id });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Login with email/password
// @route   POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ success: false, message: 'Email and password required.' });

        const user = await User.findOne({ email });
        if (!user || !user.passwordHash)
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match)
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return res.status(401).json({ success: false, message: 'Refresh token missing.' });

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);
        if (!user)
            return res.status(401).json({ success: false, message: 'User not found.' });

        const newAccessToken = generateAccessToken(user._id);
        res.json({ success: true, accessToken: newAccessToken });
    } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    }
};




module.exports = { register, login, refreshToken };
