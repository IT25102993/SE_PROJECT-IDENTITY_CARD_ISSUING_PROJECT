import express from 'express';
import {
  getApplications,
  createApplication,
  deleteApplication
} from './applicationController.js';
import {
  triggerBotVerification,
  approveApplication,
  rejectApplication
} from '../verification-management/verificationController.js';
import {
  getApplicationDocuments,
  uploadDocument
} from '../document-upload-management/documentController.js';
import { verifyToken, requireRole } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getApplications);
router.post('/', createApplication);

// Attached documents routes
router.get('/:id/documents', getApplicationDocuments);
router.post('/:id/documents', uploadDocument);

// Bot verification route
router.post('/:id/bot-verify', triggerBotVerification);

// Approver / Officer decisions
router.put('/:id/approve', verifyToken, requireRole('Officer', 'Admin', 'Approver', 'Verification Officer'), approveApplication);
router.put('/:id/reject', verifyToken, requireRole('Officer', 'Admin', 'Approver', 'Verification Officer'), rejectApplication);

// Delete
router.delete('/:id', verifyToken, requireRole('Admin'), deleteApplication);

export default router;
