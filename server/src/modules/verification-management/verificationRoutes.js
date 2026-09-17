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

// Senior Approver decision routes (strictly Approver and Admin)
router.put('/applications/:id/approve', verifyToken, requireRole('Approver', 'Admin'), approveApplication);
router.put('/:id/approve', verifyToken, requireRole('Approver', 'Admin'), approveApplication);

router.put('/applications/:id/reject', verifyToken, requireRole('Approver', 'Admin'), rejectApplication);
router.put('/:id/reject', verifyToken, requireRole('Approver', 'Admin'), rejectApplication);

export default router;
