import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDb } from './config/db.js';

// Modular management routes
import authRoutes from './modules/user-management/authRoutes.js';
import applicationRoutes from './modules/application-form-management/applicationRoutes.js';
import verificationRoutes from './modules/verification-management/verificationRoutes.js';
import documentRoutes from './modules/document-upload-management/documentRoutes.js';
import adminRoutes from './modules/admin-management/adminRoutes.js';
import operationRoutes from './modules/operation-management/operationRoutes.js';

import { initSampleDocuments } from './modules/document-upload-management/documentStorage.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file hosting for uploaded citizen documents
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// ── Modular Routes ──────────────────────────────────────────────────────────
// 1. User Management
app.use('/api/auth', authRoutes);
app.use('/api/users', authRoutes);

// 2. Application Form Management
app.use('/api/applications', applicationRoutes);

// 3. Document Upload Management
app.use('/api/documents', documentRoutes);

// 4. Verification Management
app.use('/api/verification', verificationRoutes);

// 5. Admin Management
app.use('/api/admin', adminRoutes);

// 6. Operation Management
app.use('/api/operations', operationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'NexusGov Identity Card System API (Modular Architecture)',
    modules: [
      'user-management',
      'application-form-management',
      'verification-management',
      'document-upload-management',
      'admin-management',
      'operation-management'
    ],
    timestamp: new Date().toISOString()
  });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ── Start Server ─────────────────────────────────────────────────────────────
const start = async () => {
  await initDb();
  initSampleDocuments();
  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`NexusGov Server running on http://localhost:${PORT}`);
    console.log(`Health Check: http://localhost:${PORT}/api/health`);
    console.log('Modules Active: user, application, verification, document, admin, operation');
    console.log('====================================================');
  });
};

start();

export default app;
