import express from 'express';
import {
  getAllDocuments,
  getApplicationDocuments,
  uploadDocument,
  deleteDocument
} from './documentController.js';
import { verifyToken, requireRole } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Application documents endpoints
router.get('/application/:id', getApplicationDocuments);
router.post('/application/:id', uploadDocument);
router.get('/applications/:id/documents', getApplicationDocuments);
router.post('/applications/:id/documents', uploadDocument);

// Admin & Officer: View all uploaded documents
router.get('/', verifyToken, requireRole('Admin', 'Officer', 'Approver'), getAllDocuments);

// Admin: Delete a document
router.delete('/:documentId', verifyToken, requireRole('Admin'), deleteDocument);

export default router;
