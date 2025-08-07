const { Payment } = require('../models');
const { NotFoundError } = require('../middlewares/errorHandler');

exports.listPayments = async (req, res, next) => {
  try {
    const payments = await Payment.findAll({ where: { user_id: req.user.id } });
    res.json(payments);
  } catch (err) { next(err); }
};

exports.createPayment = async (req, res, next) => {
  try {
    const data = { ...req.body, user_id: req.user.id, payment_status: 'pending', transaction_id: `TXN${Date.now()}` };
    const payment = await Payment.create(data);
    // In production, integrate with payment gateway here
    res.status(201).json(payment);
  } catch (err) { next(err); }
};

exports.getPaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findOne({ where: { id, user_id: req.user.id } });
    if (!payment) throw new NotFoundError('Payment not found');
    // Mock: randomly set status to success or failed if still pending
    if (payment.payment_status === 'pending') {
      payment.payment_status = Math.random() > 0.5 ? 'success' : 'failed';
      await payment.save();
    }
    res.json({ status: payment.payment_status });
  } catch (err) { next(err); }
}; 