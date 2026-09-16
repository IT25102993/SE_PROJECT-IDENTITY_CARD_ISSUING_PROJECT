import express from 'express';
import {
  registerStaff,
  getAllUsers,
  updateUser,
  deleteUser,
  getAuditLogs,
  getDeletionRequests,
  approveDeletionRequest,
  rejectDeletionRequest
} from './adminController.js';
import { verifyToken, requireRole } from '../../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require Admin role
router.use(verifyToken, requireRole('Admin'));

// User management
router.get('/users', getAllUsers);
router.post('/register-staff', registerStaff);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/audit-logs', getAuditLogs);

// Account deletion request governance
router.get('/deletion-requests', getDeletionRequests);
router.put('/deletion-requests/:id/approve', approveDeletionRequest);
router.put('/deletion-requests/:id/reject', rejectDeletionRequest);

export default router;
