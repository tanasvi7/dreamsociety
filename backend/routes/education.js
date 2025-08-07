const express = require('express');
const router = express.Router();
const educationController = require('../controllers/educationController');
const { authenticateJWT } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const Joi = require('joi');

const educationSchema = Joi.object({
  degree: Joi.string().max(255).required(),
  institution: Joi.string().max(255).required(),
  year_of_passing: Joi.number().integer().min(1900).max(2100).required(),
  grade: Joi.string().max(50).allow('', null)
});

router.get('/', authenticateJWT, educationController.getEducations);
router.post('/', authenticateJWT, validate(educationSchema), educationController.createEducation);
router.put('/:id', authenticateJWT, validate(educationSchema), educationController.updateEducation);
router.delete('/:id', authenticateJWT, educationController.deleteEducation);

module.exports = router; 