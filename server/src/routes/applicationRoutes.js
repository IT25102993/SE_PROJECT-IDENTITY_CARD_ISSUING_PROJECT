import express from 'express';
import {
  getApplications,
  createApplication,
  approveApplication,
  rejectApplication,
  updateStatus,
  deleteApplication
} from '../controllers/applicationController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getApplications);
router.post('/', createApplication);
router.put('/:id/approve', verifyToken, requireRole('Officer', 'Admin', 'Approver', 'Verification Officer'), approveApplication);
router.put('/:id/reject', verifyToken, requireRole('Officer', 'Admin', 'Approver', 'Verification Officer'), rejectApplication);
router.patch('/:id/status', verifyToken, requireRole('Officer', 'Admin', 'Approver', 'Verification Officer'), updateStatus);
router.delete('/:id', verifyToken, requireRole('Admin'), deleteApplication);

export default router;

