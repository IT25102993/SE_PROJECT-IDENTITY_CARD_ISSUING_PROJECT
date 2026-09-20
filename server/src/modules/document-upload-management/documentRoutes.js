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

// Admin, Form Officer & Document Officer: View all uploaded documents
router.get('/', verifyToken, requireRole('Admin', 'Form-Officer', 'Document-Officer', 'Approver'), getAllDocuments);

// Admin & Document Officer: Delete a document
router.delete('/:documentId', verifyToken, requireRole('Admin', 'Document-Officer'), deleteDocument);

export default router;
