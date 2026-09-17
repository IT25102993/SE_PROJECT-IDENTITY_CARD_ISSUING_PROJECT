import express from 'express';
import {
  updateStatus,
  getPrintQueue,
  getAnalytics
} from './operationController.js';
import { verifyToken, requireRole } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Operational metrics & analytics
router.get('/analytics', verifyToken, requireRole('Admin', 'Officer', 'Approver'), getAnalytics);

// Card printing queue (strictly Operational personnel and System Admin)
router.get('/print-queue', verifyToken, requireRole('Operational', 'Admin'), getPrintQueue);

// Status update (Printed, Issued, Processing, Dispatched)
router.patch('/applications/:id/status', verifyToken, requireRole('Operational', 'Admin', 'Officer', 'Approver', 'Verification Officer'), updateStatus);
router.patch('/:id/status', verifyToken, requireRole('Operational', 'Admin', 'Officer', 'Approver', 'Verification Officer'), updateStatus);

export default router;
