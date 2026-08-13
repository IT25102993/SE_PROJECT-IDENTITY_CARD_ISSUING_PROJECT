import express from 'express';
import {
  getApplications,
  createApplication,
  approveApplication
} from '../controllers/applicationController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getApplications);
router.post('/', createApplication);
router.put('/:id/approve', verifyToken, requireRole('Officer', 'Admin', 'Approver'), approveApplication);

export default router;
