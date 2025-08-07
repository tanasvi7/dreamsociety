const { Profile } = require('../models');
const { ValidationError } = require('../middlewares/errorHandler');

exports.createProfileForUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { user_id, ...profileData } = req.body;
    if (!user_id) throw new ValidationError('user_id is required');
    const exists = await Profile.findOne({ where: { user_id } });
    if (exists) throw new ValidationError('Profile already exists');
    const profile = await Profile.create({ user_id, ...profileData });
    res.status(201).json(profile);
  } catch (err) { next(err); }
}; 