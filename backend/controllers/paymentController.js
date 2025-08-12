const { Payment, User } = require('../models');
const { NotFoundError, ValidationError } = require('../middlewares/errorHandler');

exports.listPayments = async (req, res, next) => {
  try {
    const payments = await Payment.findAll({ where: { user_id: req.user.id } });
    res.json(payments);
  } catch (err) { next(err); }
};

exports.createPayment = async (req, res, next) => {
  try {
    const { amount, payment_method, transaction_number, transaction_type = 'upi', plan_type, billing_cycle } = req.body;
    
    // Validate required fields
    if (!amount || !payment_method) {
      throw new ValidationError('Amount and payment method are required');
    }

    // Validate transaction type
    const validTransactionTypes = ['upi', 'card', 'netbanking', 'wallet'];
    if (!validTransactionTypes.includes(transaction_type)) {
      throw new ValidationError('Invalid transaction type');
    }

    // Always set payment status as pending initially - admin will approve/reject
    const payment_status = 'pending';

    const data = { 
      user_id: req.user.id, 
      amount, 
      payment_method, 
      transaction_number: transaction_number || '',
      transaction_type,
      payment_status, 
      transaction_id: `TXN${Date.now()}` 
    };
    
    const payment = await Payment.create(data);
    
    res.status(201).json(payment);
  } catch (err) { next(err); }
};

exports.submitPayment = async (req, res, next) => {
  try {
    const { payment_id, transaction_number, transaction_type = 'upi' } = req.body;
    
    if (!payment_id || !transaction_number) {
      throw new ValidationError('Payment ID and transaction number are required');
    }

    // Find the payment
    const payment = await Payment.findOne({ 
      where: { id: payment_id, user_id: req.user.id } 
    });
    
    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    // Update payment with transaction details
    payment.transaction_number = transaction_number;
    payment.transaction_type = transaction_type;
    payment.payment_status = 'success';
    await payment.save();

    // Update user subscription status
    const user = await User.findByPk(req.user.id);
    if (user) {
      user.is_subscribed = true;
      await user.save();
    }

    res.json({ 
      success: true, 
      message: 'Payment submitted successfully',
      payment: payment
    });
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