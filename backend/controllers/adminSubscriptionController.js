const { Payment, User, Profile } = require('../models');
const { NotFoundError, ValidationError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');

// Get all payments with user details for admin review
exports.getAllPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};
    if (status) {
      whereClause.payment_status = status;
    }

    // Build user search clause
    const userWhereClause = {};
    if (search) {
      userWhereClause[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    const payments = await Payment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          where: userWhereClause,
          attributes: ['id', 'full_name', 'email', 'phone', 'is_subscribed', 'created_at'],
          include: [
            {
              model: Profile,
              as: 'profile',
              attributes: ['photo_url', 'village', 'district']
            }
          ]
        }
      ],
      order: [['payment_time', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(payments.count / limit);

    res.json({
      payments: payments.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: payments.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) { next(err); }
};

// Get payment details by ID
exports.getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email', 'phone', 'is_subscribed', 'created_at'],
          include: [
            {
              model: Profile,
              as: 'profile',
              attributes: ['photo_url', 'village', 'district', 'mandal']
            }
          ]
        }
      ]
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    res.json(payment);
  } catch (err) { next(err); }
};

// Approve subscription (accept payment)
exports.approveSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;

    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email', 'is_subscribed']
        }
      ]
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    // Update payment status
    payment.payment_status = 'success';
    if (admin_notes) {
      payment.admin_notes = admin_notes;
    }
    await payment.save();

    // Update user subscription status
    const user = payment.user;
    user.is_subscribed = true;
    await user.save();

    // Log admin action
    console.log(`[ADMIN] Payment ${id} approved by admin ${req.user.id} for user ${user.id}`);

    res.json({
      success: true,
      message: 'Subscription approved successfully',
      payment: {
        id: payment.id,
        status: payment.payment_status,
        user: {
          id: user.id,
          name: user.full_name,
          email: user.email,
          is_subscribed: user.is_subscribed
        }
      }
    });
  } catch (err) { next(err); }
};

// Reject subscription (reject payment)
exports.rejectSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { admin_notes, reason } = req.body;

    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email', 'is_subscribed']
        }
      ]
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    // Update payment status
    payment.payment_status = 'failed';
    if (admin_notes) {
      payment.admin_notes = admin_notes;
    }
    if (reason) {
      payment.rejection_reason = reason;
    }
    await payment.save();

    // Keep user as unsubscribed
    const user = payment.user;
    user.is_subscribed = false;
    await user.save();

    // Log admin action
    console.log(`[ADMIN] Payment ${id} rejected by admin ${req.user.id} for user ${user.id}`);

    res.json({
      success: true,
      message: 'Subscription rejected successfully',
      payment: {
        id: payment.id,
        status: payment.payment_status,
        user: {
          id: user.id,
          name: user.full_name,
          email: user.email,
          is_subscribed: user.is_subscribed
        }
      }
    });
  } catch (err) { next(err); }
};

// Get subscription statistics
exports.getSubscriptionStats = async (req, res, next) => {
  try {
    const totalPayments = await Payment.count();
    const pendingPayments = await Payment.count({ where: { payment_status: 'pending' } });
    const approvedPayments = await Payment.count({ where: { payment_status: 'success' } });
    const rejectedPayments = await Payment.count({ where: { payment_status: 'failed' } });
    const subscribedUsers = await User.count({ where: { is_subscribed: true } });

    res.json({
      totalPayments,
      pendingPayments,
      approvedPayments,
      rejectedPayments,
      subscribedUsers
    });
  } catch (err) { next(err); }
};
