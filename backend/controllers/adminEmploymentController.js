const { EmploymentDetail } = require('../models');
const { ValidationError } = require('../middlewares/errorHandler');

exports.createEmploymentForUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { user_id, ...employmentData } = req.body;
    if (!user_id) throw new ValidationError('user_id is required');
    const employment = await EmploymentDetail.create({ user_id, ...employmentData });
    res.status(201).json(employment);
  } catch (err) { next(err); }
}; 