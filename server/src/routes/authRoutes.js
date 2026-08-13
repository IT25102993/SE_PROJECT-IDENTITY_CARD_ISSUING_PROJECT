import express from 'express';
import { register, login, getMe, logout, sendOtp, verifyOtp } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/send-otp', sendOtp);       // Step 1: send OTP to email
router.post('/verify-otp', verifyOtp);   // Step 2: verify the OTP code
router.post('/register', register);       // Step 3: complete registration
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.post('/logout', verifyToken, logout);

export default router;
