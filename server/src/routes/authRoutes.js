import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  sendOtp,
  verifyOtp,
  getAllUsers,
  registerStaff,
  updateUser,
  deleteUser
} from '../controllers/authController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/send-otp', sendOtp);       // Step 1: send OTP to email
router.post('/verify-otp', verifyOtp);   // Step 2: verify the OTP code
router.post('/register', register);       // Step 3: complete registration (default Citizen)
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.post('/logout', verifyToken, logout);

// Admin staff and user management routes (Only System Administrators can access)
router.get('/users', verifyToken, requireRole('Admin'), getAllUsers);
router.post('/register-staff', verifyToken, requireRole('Admin'), registerStaff);
router.patch('/users/:id', verifyToken, requireRole('Admin'), updateUser);
router.delete('/users/:id', verifyToken, requireRole('Admin'), deleteUser);

export default router;

