import express from 'express';
import {
  getApplications,
  createApplication,
  updateApplication,
  claimApplication,
  unclaimApplication,
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
import { updateStatus } from '../operation-management/operationController.js';
import { verifyToken, requireRole } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getApplications);
router.post('/', createApplication);

// Attached documents routes
router.get('/:id/documents', getApplicationDocuments);
router.post('/:id/documents', uploadDocument);

// Bot verification route
router.post('/:id/bot-verify', triggerBotVerification);

// Officer & Staff Application Management: View, Update, Pool Management
router.put('/:id', verifyToken, requireRole('Officer', 'Admin', 'Approver', 'Verification Officer'), updateApplication);
router.post('/:id/claim', verifyToken, requireRole('Officer', 'Admin', 'Approver', 'Verification Officer'), claimApplication);
router.post('/:id/unclaim', verifyToken, requireRole('Officer', 'Admin', 'Approver', 'Verification Officer'), unclaimApplication);

// Status update (Printed, Approved, Dispatched, etc.)
router.patch('/:id/status', verifyToken, requireRole('Officer', 'Admin', 'Approver', 'Verification Officer'), updateStatus);
router.put('/:id/status', verifyToken, requireRole('Officer', 'Admin', 'Approver', 'Verification Officer'), updateStatus);

// Approver decisions (strictly Senior Approvers and Admin)
router.put('/:id/approve', verifyToken, requireRole('Approver', 'Admin'), approveApplication);
router.put('/:id/reject', verifyToken, requireRole('Approver', 'Admin'), rejectApplication);

// Delete - Restricted strictly to Administrator (Officers cannot delete from system)
router.delete('/:id', verifyToken, requireRole('Admin'), deleteApplication);

export default router;
