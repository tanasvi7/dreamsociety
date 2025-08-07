const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticateJWT } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const Joi = require('joi');

const jobSchema = Joi.object({
  title: Joi.string().max(255).required(),
  description: Joi.string().required(),
  skills_required: Joi.string().required(),
  job_type: Joi.string().valid('full-time', 'part-time', 'contract').required(),
  salary_range: Joi.string().max(50).allow('', null),
  location: Joi.string().max(255).allow('', null),
  map_lat: Joi.number().allow(null),
  map_lng: Joi.number().allow(null)
});

router.get('/', jobController.listJobs);
router.get('/:id', jobController.getJob);
router.post('/', authenticateJWT, validate(jobSchema), jobController.createJob);
router.put('/:id', authenticateJWT, validate(jobSchema), jobController.updateJob);
router.delete('/:id', authenticateJWT, jobController.deleteJob);
router.post('/apply/:id', authenticateJWT, jobController.applyJob);
router.post('/:id/accept', authenticateJWT, jobController.acceptJob);
router.post('/:id/reject', authenticateJWT, jobController.rejectJob);

module.exports = router; 