const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateJWT } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const Joi = require('joi');

const paymentSchema = Joi.object({
  amount: Joi.number().min(1).required(),
  payment_method: Joi.string().max(50).required()
});

router.get('/', authenticateJWT, paymentController.listPayments);
router.post('/', authenticateJWT, validate(paymentSchema), paymentController.createPayment);
router.get('/status/:id', authenticateJWT, paymentController.getPaymentStatus);

module.exports = router; 