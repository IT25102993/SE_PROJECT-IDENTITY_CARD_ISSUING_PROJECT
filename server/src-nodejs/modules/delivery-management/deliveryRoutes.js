import express from 'express';
import {
  getDeliveryJobPool,
  getDeliveryStats,
  updateDeliveryStatus
} from './deliveryController.js';
import { verifyToken, requireRole } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Delivery job pool — orders handed over by Operation Management
router.get('/job-pool', verifyToken, requireRole('Delivery-Manager'), getDeliveryJobPool);

// Delivery counts per status (KPI cards)
router.get('/stats', verifyToken, requireRole('Delivery-Manager'), getDeliveryStats);

// Record the last-mile delivery outcome
router.patch('/:id/status', verifyToken, requireRole('Delivery-Manager'), updateDeliveryStatus);

export default router;