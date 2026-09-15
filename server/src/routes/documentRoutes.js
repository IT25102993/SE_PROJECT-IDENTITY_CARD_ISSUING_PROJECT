import express from 'express';
import {
  getAllDocuments,
  getApplicationDocuments,
  uploadDocument,
  deleteDocument
} from '../controllers/documentController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Citizen can fetch documents for an application
router.get('/application/:id', getApplicationDocuments);
router.post('/application/:id', uploadDocument);
router.get('/applications/:id/documents', getApplicationDocuments);
router.post('/applications/:id/documents', uploadDocument);

// Admin & Officer can view all documents across all applications
router.get('/', verifyToken, requireRole('Admin', 'Officer', 'Approver'), getAllDocuments);

// Admin can delete a document
router.delete('/:documentId', verifyToken, requireRole('Admin'), deleteDocument);

export default router;
