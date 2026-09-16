import express from 'express';
import {
  getApplications,
  createApplication,
  updateApplication,
  claimApplication,
  unclaimApplication,
  deleteApplication
} from '../modules/application-form-management/applicationController.js';
import {
  triggerBotVerification,
  approveApplication,
  rejectApplication
} from '../modules/verification-management/verificationController.js';
import {
  getApplicationDocuments,
  uploadDocument
} from '../modules/document-upload-management/documentController.js';
import { updateStatus } from '../modules/operation-management/operationController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getApplications);
router.post('/', createApplication);

// Document routes linked to application
router.get('/:id/documents', getApplicationDocuments);
router.post('/:id/documents', uploadDocument);

// Bot verification
router.post('/:id/bot-verify', triggerBotVerification);

// Officer & Staff Application Management: View, Update, Pool Management
router.put('/:id', verifyToken, requireRole('Officer', 'Admin', 'Approver', 'Verification Officer'), updateApplication);
router.post('/:id/claim', verifyToken, requireRole('Officer', 'Admin', 'Approver', 'Verification Officer'), claimApplication);
router.post('/:id/unclaim', verifyToken, requireRole('Officer', 'Admin', 'Approver', 'Verification Officer'), unclaimApplication);

// Officer decision routes
router.put('/:id/approve', verifyToken, requireRole('Officer', 'Admin', 'Approver', 'Verification Officer'), approveApplication);
router.put('/:id/reject', verifyToken, requireRole('Officer', 'Admin', 'Approver', 'Verification Officer'), rejectApplication);
router.patch('/:id/status', verifyToken, requireRole('Officer', 'Admin', 'Approver', 'Verification Officer'), updateStatus);
router.delete('/:id', verifyToken, requireRole('Admin'), deleteApplication);

export default router;
