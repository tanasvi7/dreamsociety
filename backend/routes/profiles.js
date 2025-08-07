const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateJWT } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const Joi = require('joi');

const profileSchema = Joi.object({
  photo_url: Joi.string().allow('', null),
  dob: Joi.alternatives().try(Joi.date().iso(), Joi.string().allow('', null)),
  gender: Joi.string().valid('male', 'female', 'other').allow('', null),
  village: Joi.string().max(100).allow('', null),
  mandal: Joi.string().max(100).allow('', null),
  district: Joi.string().max(100).allow('', null),
  pincode: Joi.string().max(10).allow('', null),
  caste: Joi.string().max(100).allow('', null),
  subcaste: Joi.string().max(100).allow('', null),
  marital_status: Joi.string().max(50).allow('', null),
  native_place: Joi.string().max(100).allow('', null)
});

router.get('/', authenticateJWT, profileController.getProfile);
router.post('/', authenticateJWT, validate(profileSchema), profileController.createProfile);
router.put('/', authenticateJWT, validate(profileSchema), profileController.updateProfile);

module.exports = router; 