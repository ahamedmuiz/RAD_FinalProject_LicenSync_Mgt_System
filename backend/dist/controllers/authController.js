"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.logoutUser = exports.refreshAccessToken = exports.changePassword = exports.loginUser = exports.registerUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const sendEmail_1 = require("../utils/sendEmail");
// to generate a short-lived JWT
const generateToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '15m',
    });
};
// to generate a long-lived HTTP-Only Refresh Token
const generateRefreshToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};
// @desc    Register a new user (Mainly used for initial setup right now)
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, companyId } = req.body;
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const user = await User_1.default.create({
            name,
            email,
            password,
            role: role || 'CLIENT',
            companyId: companyId || null,
        });
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id.toString(), user.role),
            });
        }
        else {
            res.status(400).json({ message: 'Invalid user data received' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.registerUser = registerUser;
// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            // 1. Generate the 7-day refresh token
            const refreshToken = generateRefreshToken(user._id.toString());
            // 2. Attach it as an HTTP-Only cookie (Cannot be stolen by JavaScript!)
            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development', // Uses secure HTTPS in production
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
            });
            // 3. Send the normal short-lived access token to the frontend
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                mustChangePassword: user.mustChangePassword,
                token: generateToken(user._id.toString(), user.role),
            });
        }
        else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.loginUser = loginUser;
// @desc    Change User Password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User_1.default.findById(req.user._id);
        // Verify the current (temporary) password is correct
        if (user && (await user.matchPassword(currentPassword))) {
            user.password = newPassword;
            user.mustChangePassword = false; // They have successfully changed it!
            await user.save();
            // Return fresh user data with the updated flag
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                mustChangePassword: user.mustChangePassword,
                token: req.headers.authorization.split(' ')[1] // Keep the current token
            });
        }
        else {
            res.status(401).json({ message: 'Invalid current password' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.changePassword = changePassword;
// @desc    Refresh access token silently
// @route   GET /api/auth/refresh
const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.jwt;
        if (!refreshToken) {
            res.status(401).json({ message: 'No refresh token found in cookies' });
            return;
        }
        // Verify the cookie token
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_SECRET);
        const user = await User_1.default.findById(decoded.id).select('-password');
        if (!user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }
        // Issue a brand new 15-minute access token!
        res.json({
            token: generateToken(user._id.toString(), user.role)
        });
    }
    catch (error) {
        res.status(401).json({ message: 'Refresh token expired or invalid' });
    }
};
exports.refreshAccessToken = refreshAccessToken;
// @desc    Logout user & destroy cookie
// @route   POST /api/auth/logout
const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0), // Instantly expire the cookie
    });
    res.status(200).json({ message: 'Logged out successfully' });
};
exports.logoutUser = logoutUser;
// @desc    Forgot Password - Send Email
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    try {
        const user = await User_1.default.findOne({ email: req.body.email });
        if (!user) {
            res.status(404).json({ message: 'There is no user with that email address.' });
            return;
        }
        // Generate a temporary reset token (Valid for 15 mins)
        const resetToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        // Create the reset URL pointing to your React frontend
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
        const message = `
      <h2>LicenSync Password Reset</h2>
      <p>You requested a password reset. Please go to this link to reset your password:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
      <p><em>This link is valid for 15 minutes.</em></p>
    `;
        await (0, sendEmail_1.sendEmail)({
            email: user.email,
            subject: 'LicenSync - Password Reset Token',
            html: message,
        });
        res.status(200).json({ message: 'Email sent successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Email could not be sent. Please try again later.' });
    }
};
exports.forgotPassword = forgotPassword;
// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
    try {
        // Verify the token from the URL
        const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
        if (!token) {
            res.status(400).json({ message: 'Invalid or expired token' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await User_1.default.findById(decoded.id);
        if (!user) {
            res.status(400).json({ message: 'Invalid or expired token' });
            return;
        }
        // Update the password
        user.password = req.body.password;
        await user.save();
        res.status(200).json({ message: 'Password reset successful. You can now log in.' });
    }
    catch (error) {
        res.status(400).json({ message: 'Invalid or expired token' });
    }
};
exports.resetPassword = resetPassword;
