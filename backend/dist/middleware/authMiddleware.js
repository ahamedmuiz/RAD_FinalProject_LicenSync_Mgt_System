"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectManagerOnly = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
// 2. Middleware to protect routes (Must be logged in)
const protect = async (req, res, next) => {
    let token;
    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (Bearer <token>)
            token = req.headers.authorization.split(' ')[1];
            // Verify token using our secret
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            // Find the user in DB and attach to request (excluding the password)
            req.user = await User_1.default.findById(decoded.id).select('-password');
            next();
        }
        catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};
exports.protect = protect;
// 3. Middleware to check for Project Manager role
const projectManagerOnly = (req, res, next) => {
    if (req.user && req.user.role === 'PROJECT_MANAGER') {
        next();
    }
    else {
        res.status(403).json({ message: 'Access denied. Project Managers only.' });
    }
};
exports.projectManagerOnly = projectManagerOnly;
