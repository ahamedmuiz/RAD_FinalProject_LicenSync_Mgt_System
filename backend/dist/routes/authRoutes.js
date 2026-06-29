"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Add refreshAccessToken and logoutUser to your imports
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/register', authController_1.registerUser);
router.post('/login', authController_1.loginUser);
router.put('/change-password', authMiddleware_1.protect, authController_1.changePassword);
// Add the two new routes here!
router.get('/refresh', authController_1.refreshAccessToken);
router.post('/logout', authController_1.logoutUser);
router.post('/forgot-password', authController_1.forgotPassword);
router.put('/reset-password/:token', authController_1.resetPassword);
exports.default = router;
