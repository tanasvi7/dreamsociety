const { EducationDetail, User } = require('../models');
const { ValidationError, NotFoundError } = require('../middlewares/errorHandler');

exports.createEducation = async (req, res, next) => {
  try {
    const { institution, degree, year_of_passing, field_of_study, start_date, end_date, grade, description } = req.body;
    const user_id = req.user.id;

    const education = await EducationDetail.create({
      user_id,
      institution,
      degree,
      year_of_passing,
      field_of_study,
      start_date,
      end_date,
      grade,
      description
    });

    res.status(201).json({
      message: 'Education detail created successfully',
      education
    });
  } catch (err) {
    next(err);
  }
};

exports.getEducations = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const educations = await EducationDetail.findAll({
      where: { user_id },
      order: [['year_of_passing', 'DESC']]
    });

    res.json({ educations });
  } catch (err) {
    next(err);
  }
};

exports.getEducation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const education = await EducationDetail.findOne({
      where: { id, user_id }
    });

    if (!education) {
      throw new NotFoundError('Education detail not found');
    }

    res.json({ education });
  } catch (err) {
    next(err);
  }
};

exports.updateEducation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const { institution, degree, year_of_passing, field_of_study, start_date, end_date, grade, description } = req.body;

    const education = await EducationDetail.findOne({
      where: { id, user_id }
    });

    if (!education) {
      throw new NotFoundError('Education detail not found');
    }

    await education.update({
      institution,
      degree,
      year_of_passing,
      field_of_study,
      start_date,
      end_date,
      grade,
      description
    });

    res.json({
      message: 'Education detail updated successfully',
      education
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteEducation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const education = await EducationDetail.findOne({
      where: { id, user_id }
    });

    if (!education) {
      throw new NotFoundError('Education detail not found');
    }

    await education.destroy();

    res.json({ message: 'Education detail deleted successfully' });
  } catch (err) {
    next(err);
  }
}; 