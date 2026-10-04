import express from 'express';
import {
  getDeliveryPool,
  updateDeliveryStatus,
  getDeliveryStats
} from './deliveryController.js';
import { verifyToken, requireRole } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Every delivery endpoint is strictly restricted to Delivery-Manager personnel
router.use(verifyToken, requireRole('Delivery-Manager'));

// Delivery Job Pool — orders pushed out of Operation Management (Printing Section)
router.get('/job-pool', getDeliveryPool);

// KPI counters for the delivery dashboard
router.get('/stats', getDeliveryStats);

// Change delivery status: Dispatched | Delivered | Not-Delivered | Canceled
router.patch('/:id/status', updateDeliveryStatus);

export default router;
