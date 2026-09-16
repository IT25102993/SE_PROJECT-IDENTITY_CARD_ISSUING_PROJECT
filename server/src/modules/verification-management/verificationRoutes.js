import express from 'express';
import {
  triggerBotVerification,
  approveApplication,
  rejectApplication
} from './verificationController.js';
import { verifyToken, requireRole } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Bot verification check (on-demand re-trigger)
router.post('/applications/:id/bot-verify', triggerBotVerification);
router.post('/:id/bot-verify', triggerBotVerification);

// Officer verification decision routes
router.put('/applications/:id/approve', verifyToken, requireRole('Officer', 'Admin', 'Approver', 'Verification Officer'), approveApplication);
router.put('/:id/approve', verifyToken, requireRole('Officer', 'Admin', 'Approver', 'Verification Officer'), approveApplication);

router.put('/applications/:id/reject', verifyToken, requireRole('Officer', 'Admin', 'Approver', 'Verification Officer'), rejectApplication);
router.put('/:id/reject', verifyToken, requireRole('Officer', 'Admin', 'Approver', 'Verification Officer'), rejectApplication);

export default router;
