const { User } = require('../models');
const bcrypt = require('bcrypt');
const { ValidationError, NotFoundError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');

exports.listUsers = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { search, role } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }
    const users = await User.findAll({ where, attributes: { exclude: ['password_hash'] } });
    res.json(users);
  } catch (err) { next(err); }
};

exports.createUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { full_name, email, phone, password, role } = req.body;
    if (!full_name || !email || !phone || !password) throw new ValidationError('Missing required fields');
    const exists = await User.findOne({ where: { [Op.or]: [{ email }, { phone }] } });
    if (exists) throw new ValidationError('Email or phone already exists');
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ full_name, email, phone, password_hash, role });
    res.status(201).json(user);
  } catch (err) { next(err); }
};

exports.updateUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) throw new NotFoundError('User not found');
    const { full_name, email, phone, role } = req.body;
    if (email || phone) {
      const exists = await User.findOne({ where: { [Op.or]: [{ email }, { phone }], id: { [Op.ne]: id } } });
      if (exists) throw new ValidationError('Email or phone already in use');
    }
    if (full_name) user.full_name = full_name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    await user.save();
    res.json({ message: 'User updated' });
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) throw new NotFoundError('User not found');
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { id } = req.params;
    const { password } = req.body;
    if (!password) throw new ValidationError('Password required');
    const user = await User.findByPk(id);
    if (!user) throw new NotFoundError('User not found');
    user.password_hash = await bcrypt.hash(password, 10);
    await user.save();
    res.json({ message: 'Password reset' });
  } catch (err) { next(err); }
};

exports.changeRole = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { id } = req.params;
    const { role } = req.body;
    if (!role) throw new ValidationError('Role required');
    const user = await User.findByPk(id);
    if (!user) throw new NotFoundError('User not found');
    user.role = role;
    await user.save();
    res.json({ message: 'Role changed' });
  } catch (err) { next(err); }
}; 