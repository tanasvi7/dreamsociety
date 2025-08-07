const express = require('express');
const router = express.Router();
const employmentController = require('../controllers/employmentController');
const { authenticateJWT } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const Joi = require('joi');

const employmentSchema = Joi.object({
  company_name: Joi.string().max(255).required(),
  role: Joi.string().max(255).required(),
  years_of_experience: Joi.number().min(0).max(100).required(),
  currently_working: Joi.boolean().required()
});

router.get('/', authenticateJWT, employmentController.listEmployment);
router.post('/', authenticateJWT, validate(employmentSchema), employmentController.addEmployment);
router.put('/:id', authenticateJWT, validate(employmentSchema), employmentController.updateEmployment);
router.delete('/:id', authenticateJWT, employmentController.deleteEmployment);

module.exports = router; 