import express from 'express';
import {
  getApplications,
  createApplication,
  updateApplication,
  claimApplication,
  unclaimApplication,
  deleteApplication,
  updateApplicationStatus
} from './applicationController.js';
import {
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

// Form & Document Officer Application Management: View, Update, Pool Management
router.put('/:id', verifyToken, requireRole('Form-Officer', 'Admin', 'Approver'), updateApplication);
router.post('/:id/claim', verifyToken, requireRole('Form-Officer', 'Document-Officer', 'Admin', 'Approver'), claimApplication);
router.post('/:id/unclaim', verifyToken, requireRole('Form-Officer', 'Document-Officer', 'Admin', 'Approver'), unclaimApplication);

// Status update (Printed, Approved, Dispatched, Documents-Required, etc.) — accessible by all staff roles
router.patch('/:id/status', verifyToken, requireRole('Form-Officer', 'Document-Officer', 'Admin', 'Approver', 'Operational'), updateApplicationStatus);
router.put('/:id/status', verifyToken, requireRole('Form-Officer', 'Document-Officer', 'Admin', 'Approver', 'Operational'), updateApplicationStatus);

// Approver decisions (strictly Senior Approvers and Admin)
router.put('/:id/approve', verifyToken, requireRole('Approver', 'Admin'), approveApplication);
router.put('/:id/reject', verifyToken, requireRole('Approver', 'Admin'), rejectApplication);

// Delete - Restricted strictly to Administrator (Officers cannot delete from system)
router.delete('/:id', verifyToken, requireRole('Admin'), deleteApplication);

export default router;
