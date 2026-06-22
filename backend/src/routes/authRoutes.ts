import express from 'express';
import { registerUser, loginUser, changePassword } from '../controllers/authController'; 
import { protect } from '../middleware/authMiddleware';
const router = express.Router();

// Let's add a log here so we know this file is definitely executing!
console.log("--> authRoutes.ts is successfully loaded!");

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/change-password', protect, changePassword);

export default router;