const { EmploymentDetail } = require('../models');
const { NotFoundError } = require('../middlewares/errorHandler');

exports.listEmployment = async (req, res, next) => {
  try {
    const employment = await EmploymentDetail.findAll({ where: { user_id: req.user.id } });
    res.json(employment);
  } catch (err) { next(err); }
};

exports.addEmployment = async (req, res, next) => {
  try {
    const data = { ...req.body, user_id: req.user.id };
    const entry = await EmploymentDetail.create(data);
    res.status(201).json(entry);
  } catch (err) { next(err); }
};

exports.updateEmployment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const entry = await EmploymentDetail.findOne({ where: { id, user_id: req.user.id } });
    if (!entry) throw new NotFoundError('Employment entry not found');
    Object.assign(entry, req.body);
    await entry.save();
    res.json(entry);
  } catch (err) { next(err); }
};

exports.deleteEmployment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const entry = await EmploymentDetail.findOne({ where: { id, user_id: req.user.id } });
    if (!entry) throw new NotFoundError('Employment entry not found');
    await entry.destroy();
    res.json({ message: 'Employment entry deleted' });
  } catch (err) { next(err); }
}; 