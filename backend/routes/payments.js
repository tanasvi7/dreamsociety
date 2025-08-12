const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateJWT } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const Joi = require('joi');

const paymentSchema = Joi.object({
  amount: Joi.number().min(1).required(),
  payment_method: Joi.string().max(50).required(),
  transaction_number: Joi.string().max(100).optional().allow(''),
  transaction_type: Joi.string().valid('upi', 'card', 'netbanking', 'wallet').default('upi'),
  plan_type: Joi.string().optional(),
  billing_cycle: Joi.string().valid('monthly', 'yearly').optional()
});

const submitPaymentSchema = Joi.object({
  payment_id: Joi.number().required(),
  transaction_number: Joi.string().max(100).required(),
  transaction_type: Joi.string().valid('upi', 'card', 'netbanking', 'wallet').default('upi')
});

router.get('/', authenticateJWT, paymentController.listPayments);
router.post('/', authenticateJWT, validate(paymentSchema), paymentController.createPayment);
router.post('/submit', authenticateJWT, validate(submitPaymentSchema), paymentController.submitPayment);
router.get('/:id/status', authenticateJWT, paymentController.getPaymentStatus);

module.exports = router; 