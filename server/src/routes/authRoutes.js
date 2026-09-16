import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  sendOtp,
  verifyOtp,
  checkUserDeletionEligibility,
  deleteOwnAccount,
  requestAccountDeletion
} from '../modules/user-management/authController.js';
import {
  getAllUsers,
  registerStaff,
  updateUser,
  deleteUser
} from '../modules/admin-management/adminController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public citizen OTP & auth routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', register);
router.post('/login', login);

// Authenticated user profile routes
router.get('/me', verifyToken, getMe);
router.post('/logout', verifyToken, logout);

// Account deletion workflow
router.get('/deletion-status', verifyToken, checkUserDeletionEligibility);
router.delete('/me', verifyToken, deleteOwnAccount);
router.post('/request-deletion', verifyToken, requestAccountDeletion);

// Staff & user administration routes
router.get('/users', verifyToken, requireRole('Admin'), getAllUsers);
router.post('/register-staff', verifyToken, requireRole('Admin'), registerStaff);
router.put('/users/:id', verifyToken, requireRole('Admin'), updateUser);
router.delete('/users/:id', verifyToken, requireRole('Admin'), deleteUser);

export default router;
