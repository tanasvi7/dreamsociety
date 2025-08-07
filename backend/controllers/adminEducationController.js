const { EducationDetail } = require('../models');
const { ValidationError } = require('../middlewares/errorHandler');

exports.createEducationForUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { user_id, ...educationData } = req.body;
    if (!user_id) throw new ValidationError('user_id is required');
    const education = await EducationDetail.create({ user_id, ...educationData });
    res.status(201).json(education);
  } catch (err) { next(err); }
};