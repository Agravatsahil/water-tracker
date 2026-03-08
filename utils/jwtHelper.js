const jwt = require('jsonwebtoken');

const generateAccessToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
const generateRefreshToken = (id) => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE });

const sendTokenResponse = (user, statusCode, res) => {
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Strip sensitive fields
    const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        dailyGoal: user.dailyGoal,
        authProvider: user.authProvider,
    };

    res.status(statusCode).json({
        success: true,
        accessToken,
        refreshToken,
        user: userData,
    });
};

module.exports = { generateAccessToken, generateRefreshToken, sendTokenResponse };
