import express from 'express';
import {
  getAllDocuments,
  getApplicationDocuments,
  uploadDocument,
  deleteDocument
} from '../modules/document-upload-management/documentController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/application/:id', getApplicationDocuments);
router.post('/application/:id', uploadDocument);
router.get('/applications/:id/documents', getApplicationDocuments);
router.post('/applications/:id/documents', uploadDocument);

router.get('/', verifyToken, requireRole('Admin', 'Officer', 'Approver'), getAllDocuments);
router.delete('/:documentId', verifyToken, requireRole('Admin'), deleteDocument);

export default router;
