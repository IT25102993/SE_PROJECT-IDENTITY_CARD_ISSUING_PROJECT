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
} from './authController.js';
import { verifyToken } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Public citizen authentication & verification routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', register);
router.post('/login', login);

// Protected user routes
router.get('/me', verifyToken, getMe);
router.post('/logout', verifyToken, logout);

// Account deletion workflow
router.get('/deletion-status', verifyToken, checkUserDeletionEligibility);
router.delete('/me', verifyToken, deleteOwnAccount);
router.post('/request-deletion', verifyToken, requestAccountDeletion);

// Fallback & Compatibility routes for user administration (/api/auth/..., /api/users/...)
import('../admin-management/adminController.js').then(({ registerStaff, getAllUsers, updateUser, deleteUser }) => {
  router.post('/register-staff', verifyToken, registerStaff);
  router.get('/users', verifyToken, getAllUsers);
  router.put('/users/:id', verifyToken, updateUser);
  router.patch('/users/:id', verifyToken, updateUser);
  router.delete('/users/:id', verifyToken, deleteUser);
});

export default router;
