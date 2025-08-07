const { Skill, User } = require('../models');
const { NotFoundError, ValidationError } = require('../middlewares/errorHandler');

exports.listSkills = async (req, res, next) => {
  try {
    const skills = await Skill.findAll({ where: { user_id: req.user.id } });
    res.json(skills);
  } catch (err) { next(err); }
};

exports.addSkill = async (req, res, next) => {
  try {
    const data = { ...req.body, user_id: req.user.id };
    const skill = await Skill.create(data);
    res.status(201).json(skill);
  } catch (err) { next(err); }
};

exports.updateSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findOne({ where: { id, user_id: req.user.id } });
    if (!skill) throw new NotFoundError('Skill not found');
    Object.assign(skill, req.body);
    await skill.save();
    res.json(skill);
  } catch (err) { next(err); }
};

exports.deleteSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findOne({ where: { id, user_id: req.user.id } });
    if (!skill) throw new NotFoundError('Skill not found');
    await skill.destroy();
    res.json({ message: 'Skill deleted' });
  } catch (err) { next(err); }
};

exports.endorseSkill = async (req, res, next) => {
  try {
    const { id } = req.params; // skill id
    const skill = await Skill.findByPk(id);
    if (!skill) throw new NotFoundError('Skill not found');
    if (skill.user_id === req.user.id) throw new ValidationError('Cannot endorse your own skill');
    skill.endorsed_by = req.user.id;
    await skill.save();
    res.json({ message: 'Skill endorsed' });
  } catch (err) { next(err); }
}; 