const { User, Payment, AdminLog } = require('../models');
const { Parser } = require('json2csv');
const { Op } = require('sequelize');

function sendExport(res, data, format, filename) {
  if (format === 'csv') {
    const parser = new Parser();
    const csv = parser.parse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment(filename + '.csv');
    return res.send(csv);
  } else {
    res.header('Content-Type', 'application/json');
    return res.json(data);
  }
}

exports.exportUsers = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { format = 'json', role, search } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }
    const users = await User.findAll({ where, attributes: { exclude: ['password_hash'] }, raw: true });
    sendExport(res, users, format, 'users');
  } catch (err) { next(err); }
};

exports.exportPayments = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { format = 'json', user_id, status, date_from, date_to } = req.query;
    const where = {};
    if (user_id) where.user_id = user_id;
    if (status) where.payment_status = status;
    if (date_from || date_to) {
      where.payment_time = {};
      if (date_from) where.payment_time[Op.gte] = new Date(date_from);
      if (date_to) where.payment_time[Op.lte] = new Date(date_to);
    }
    const payments = await Payment.findAll({ where, raw: true });
    sendExport(res, payments, format, 'payments');
  } catch (err) { next(err); }
};

exports.exportLogs = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { format = 'json', admin_id, action, date_from, date_to } = req.query;
    const where = {};
    if (admin_id) where.admin_id = admin_id;
    if (action) where.action = action;
    if (date_from || date_to) {
      where.log_time = {};
      if (date_from) where.log_time[Op.gte] = new Date(date_from);
      if (date_to) where.log_time[Op.lte] = new Date(date_to);
    }
    const logs = await AdminLog.findAll({ where, raw: true });
    sendExport(res, logs, format, 'admin_logs');
  } catch (err) { next(err); }
}; 