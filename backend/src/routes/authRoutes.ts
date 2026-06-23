import express from 'express';
// Add refreshAccessToken and logoutUser to your imports
import { registerUser, loginUser, changePassword, refreshAccessToken, logoutUser, forgotPassword, resetPassword } from '../controllers/authController'; 
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/change-password', protect, changePassword);

// Add the two new routes here!
router.get('/refresh', refreshAccessToken);
router.post('/logout', logoutUser);

router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

export default router;