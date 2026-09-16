import express from 'express';
import cors from 'cors';
import compression from 'compression';
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

// Global process protection against uncaught exceptions and rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────
// Gzip/deflate compression for fast payloads
app.use(compression());

// Resilient CORS policy
app.use(cors({
  origin: (origin, callback) => {
    // Allow local development and requests with no origin (e.g. mobile apps, curl)
    if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

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

// Global Express error handler to prevent unhandled rejections from crashing the process
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.'
  });
});

// ── Start Server ─────────────────────────────────────────────────────────────
const start = async () => {
  await initDb();
  initSampleDocuments();
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('====================================================');
    console.log(`NexusGov Server running locally on:  http://localhost:${PORT}`);
    console.log(`NexusGov Server running on network:  http://0.0.0.0:${PORT}`);
    console.log(`Health Check: http://localhost:${PORT}/api/health`);
    console.log('Modules Active: user, application, verification, document, admin, operation');
    console.log('====================================================');
  });

  // Optimize HTTP keep-alive timeouts to prevent dropped connections
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
};

start();

export default app;
