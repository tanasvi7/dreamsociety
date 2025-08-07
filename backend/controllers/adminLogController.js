const { AdminLog } = require('../models');

exports.listAdminLogs = async (req, res, next) => {
  try {
    if (!['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const logs = await AdminLog.findAll({ order: [['log_time', 'DESC']] });
    res.json(logs);
  } catch (err) { next(err); }
}; 