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

// Card printing queue (strictly Operational personnel only)
router.get('/print-queue', verifyToken, requireRole('Operational'), getPrintQueue);

// Status update from print queue (Printed, Dispatched)
router.patch('/applications/:id/status', verifyToken, requireRole('Operational'), updateStatus);
router.patch('/:id/status', verifyToken, requireRole('Operational'), updateStatus);

export default router;
