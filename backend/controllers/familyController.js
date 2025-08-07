const { FamilyMember } = require('../models');
const { NotFoundError, ValidationError } = require('../middlewares/errorHandler');

exports.listFamily = async (req, res, next) => {
  try {
    const family = await FamilyMember.findAll({ where: { user_id: req.user.id } });
    res.json(family);
  } catch (err) { next(err); }
};

exports.addFamily = async (req, res, next) => {
  try {
    const data = { ...req.body, user_id: req.user.id };
    console.log('Creating family member:', data);
    const member = await FamilyMember.create(data);
    console.log('Family member created successfully:', member.id);
    res.status(201).json(member);
  } catch (err) { 
    console.error('Error creating family member:', err);
    next(err); 
  }
};

exports.updateFamily = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('Updating family member:', id, 'for user:', req.user.id);
    console.log('Update data:', req.body);
    
    const member = await FamilyMember.findOne({ where: { id, user_id: req.user.id } });
    if (!member) throw new NotFoundError('Family member not found');
    
    Object.assign(member, req.body);
    await member.save();
    console.log('Family member updated successfully');
    res.json(member);
  } catch (err) { 
    console.error('Error updating family member:', err);
    next(err); 
  }
};

exports.deleteFamily = async (req, res, next) => {
  try {
    const { id } = req.params;
    const member = await FamilyMember.findOne({ where: { id, user_id: req.user.id } });
    if (!member) throw new NotFoundError('Family member not found');
    await member.destroy();
    res.json({ message: 'Family member deleted' });
  } catch (err) { next(err); }
}; 