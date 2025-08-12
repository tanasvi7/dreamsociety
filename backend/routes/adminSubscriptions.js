const express = require('express');
const router = express.Router();
const adminSubscriptionController = require('../controllers/adminSubscriptionController');
const { authenticateJWT, requireAdmin } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const Joi = require('joi');

// Validation schemas
const approveSubscriptionSchema = Joi.object({
  admin_notes: Joi.string().max(500).optional()
});

const rejectSubscriptionSchema = Joi.object({
  admin_notes: Joi.string().max(500).optional(),
  reason: Joi.string().max(200).optional()
});

// Admin subscription management routes
router.get('/', authenticateJWT, requireAdmin, adminSubscriptionController.getAllPayments);
router.get('/stats', authenticateJWT, requireAdmin, adminSubscriptionController.getSubscriptionStats);
router.get('/:id', authenticateJWT, requireAdmin, adminSubscriptionController.getPaymentById);
router.post('/:id/approve', authenticateJWT, requireAdmin, validate(approveSubscriptionSchema), adminSubscriptionController.approveSubscription);
router.post('/:id/reject', authenticateJWT, requireAdmin, validate(rejectSubscriptionSchema), adminSubscriptionController.rejectSubscription);

module.exports = router;
