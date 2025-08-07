const { User, AdminLog } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { Op } = require('sequelize');
const { Profile, EducationDetail, EmploymentDetail, FamilyMember } = require('../models');

exports.listUsers = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { page = 1, limit = 10, role, search } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    // Log the action
    await AdminLog.create({
      admin_id: req.user.id,
      action: 'list_users',
      details: JSON.stringify({ page, limit, role, search, total: count }),
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  const t = await User.sequelize.transaction();
  try {
    if (req.user.role !== 'admin') {
      await t.rollback();
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { full_name, email, phone, password, role = 'member' } = req.body;

    // Check if user already exists
    const existing = await User.findOne({
      where: { [Op.or]: [{ email }, { phone }] },
      transaction: t
    });
    if (existing) {
      await t.rollback();
      return res.status(400).json({ error: 'Email or phone already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      full_name,
      email,
      phone,
      password_hash,
      role,
      is_verified: true // Admin-created users are automatically verified
    }, { transaction: t });

    // Log the action
    await AdminLog.create({
      admin_id: req.user.id,
      action: 'create_user',
      details: JSON.stringify({
        user_id: user.id,
        email: user.email,
        role: user.role
      }),
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    }, { transaction: t });

    await t.commit();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_verified: user.is_verified,
        created_at: user.created_at
      }
    });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    const { full_name, email, phone, role } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email/phone already exists with another user
    if (email || phone) {
      const where = { id: { [Op.ne]: id } };
      if (email) where.email = email;
      if (phone) where.phone = phone;
      
      const existing = await User.findOne({ where });
      if (existing) {
        return res.status(400).json({ error: 'Email or phone already registered with another user' });
      }
    }

    // Update user
    const updateData = {};
    if (full_name) updateData.full_name = full_name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (role) updateData.role = role;

    await user.update(updateData);

    // Log the action
    await AdminLog.create({
      admin_id: req.user.id,
      action: 'update_user',
      details: JSON.stringify({
        user_id: user.id,
        updated_fields: Object.keys(updateData)
      }),
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_verified: user.is_verified,
        updated_at: user.updated_at
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log the action before deletion
    await AdminLog.create({
      admin_id: req.user.id,
      action: 'delete_user',
      details: JSON.stringify({
        deleted_user_id: user.id,
        deleted_email: user.email,
        deleted_role: user.role
      }),
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    const { password } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    const password_hash = await bcrypt.hash(password, 10);
    await user.update({ password_hash });

    // Log the action
    await AdminLog.create({
      admin_id: req.user.id,
      action: 'reset_password',
      details: JSON.stringify({
        user_id: user.id,
        user_email: user.email
      }),
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};

exports.changeRole = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    const { role } = req.body;

    // Prevent admin from changing their own role
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oldRole = user.role;
    await user.update({ role });

    // Log the action
    await AdminLog.create({
      admin_id: req.user.id,
      action: 'change_role',
      details: JSON.stringify({
        user_id: user.id,
        user_email: user.email,
        old_role: oldRole,
        new_role: role
      }),
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      message: 'User role changed successfully',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.impersonateUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { error, value } = Joi.object({
      user_id: Joi.number().integer().required()
    }).validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const targetUser = await User.findByPk(value.user_id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate JWT token for the target user
    const token = jwt.sign(
      { 
        user_id: targetUser.id, 
        email: targetUser.email, 
        role: targetUser.role,
        impersonated_by: req.user.id,
        impersonated_at: new Date().toISOString()
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Log the impersonation action
    await AdminLog.create({
      admin_id: req.user.id,
      action: 'impersonate_user',
      details: JSON.stringify({
        target_user_id: targetUser.id,
        target_email: targetUser.email,
        target_role: targetUser.role
      }),
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      message: 'User impersonation successful',
      token,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        full_name: targetUser.full_name,
        role: targetUser.role,
        impersonated_by: req.user.id,
        impersonated_at: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
}; 

exports.createFullUser = async (req, res, next) => {
  const t = await User.sequelize.transaction();
  try {
    const { user, profile, education, employment, family } = req.body;

    // Check if user already exists (email or phone)
    const existing = await User.findOne({
      where: { [Op.or]: [{ email: user.email }, { phone: user.phone }] },
      transaction: t
    });
    if (existing) {
      await t.rollback();
      if (existing.email === user.email) {
        return res.status(400).json({ error: 'Email already registered' });
      } else {
        return res.status(400).json({ error: 'Phone number already registered' });
      }
    }

    // Hash the password
    const password_hash = await bcrypt.hash(user.password, 10);

    // 1. Create user
    const { password, ...userData } = user;
    const newUser = await User.create({
      ...userData,
      password_hash,
      is_verified: true
    }, { transaction: t });

    // 2. Create profile (only for member users, or with proper validation for admin users)
    if (profile && (newUser.role === 'member' || Object.values(profile).some(val => val && val !== ''))) {
      // Handle date of birth validation
      const profileData = { ...profile, user_id: newUser.id };
      
      // Validate and format date of birth
      if (profileData.dob) {
        const dobDate = new Date(profileData.dob);
        if (isNaN(dobDate.getTime())) {
          // Invalid date, set to null
          profileData.dob = null;
        } else {
          // Valid date, format it properly
          profileData.dob = dobDate.toISOString().split('T')[0];
        }
      } else {
        // No date provided, set to null
        profileData.dob = null;
      }
      
      // Validate gender field - only create profile if gender is valid or empty
      if (profileData.gender && !['male', 'female', 'other'].includes(profileData.gender)) {
        // Invalid gender value, set to null
        profileData.gender = null;
      }
      
      // Only create profile if there's meaningful data or user is a member
      if (newUser.role === 'member' || Object.values(profileData).some(val => val && val !== '' && val !== null)) {
        await Profile.create(profileData, { transaction: t });
      }
    }

    // 3. Create education records
    if (Array.isArray(education)) {
      for (const edu of education) {
        await EducationDetail.create({ ...edu, user_id: newUser.id }, { transaction: t });
      }
    }

    // 4. Create employment records
    if (Array.isArray(employment)) {
      for (const emp of employment) {
        await EmploymentDetail.create({ ...emp, user_id: newUser.id }, { transaction: t });
      }
    }

    // 5. Create family records
    if (Array.isArray(family)) {
      for (const fam of family) {
        await FamilyMember.create({ ...fam, user_id: newUser.id }, { transaction: t });
      }
    }

    await t.commit();
    res.status(201).json({ message: 'User and related data created successfully', user_id: newUser.id });
  } catch (err) {
    await t.rollback();
    next(err);
  }
}; 