const { FamilyMember } = require('../models');
const { ValidationError } = require('../middlewares/errorHandler');

exports.createFamilyForUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { user_id, ...familyData } = req.body;
    if (!user_id) throw new ValidationError('user_id is required');
    const familyMember = await FamilyMember.create({ user_id, ...familyData });
    res.status(201).json(familyMember);
  } catch (err) { next(err); }
}; 