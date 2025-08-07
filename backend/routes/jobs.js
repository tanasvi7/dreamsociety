const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticateJWT } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const Joi = require('joi');

const jobSchema = Joi.object({
  title: Joi.string().max(255).required(),
  company: Joi.string().max(255).allow('', null),
  description: Joi.string().required(),
  skills_required: Joi.string().required(),
  job_type: Joi.string().valid('full-time', 'part-time', 'contract', 'internship', 'freelance').required(),
  work_model: Joi.string().valid('office', 'remote', 'hybrid').allow('', null),
  experience_required: Joi.string().max(100).allow('', null),
  salary_range: Joi.string().max(50).allow('', null),
  salary_min: Joi.number().allow(null),
  salary_max: Joi.number().allow(null),
  salary_currency: Joi.string().max(10).allow('', null),
  location: Joi.string().max(255).allow('', null),
  map_lat: Joi.number().allow(null),
  map_lng: Joi.number().allow(null),
  application_deadline: Joi.date().allow(null),
  contact_email: Joi.string().email().allow('', null),
  company_website: Joi.string().uri().allow('', null)
});

router.get('/', jobController.listJobs);
router.get('/:id', jobController.getJob);
router.post('/', authenticateJWT, validate(jobSchema), jobController.createJob);
router.put('/:id', authenticateJWT, validate(jobSchema), jobController.updateJob);
router.delete('/:id', authenticateJWT, jobController.deleteJob);
router.post('/apply/:id', authenticateJWT, jobController.applyJob);
router.post('/:id/accept', authenticateJWT, jobController.acceptJob);
router.post('/:id/reject', authenticateJWT, jobController.rejectJob);

// New routes for job management
router.get('/my/posts', authenticateJWT, jobController.getMyJobPosts);
router.get('/:id/applications', authenticateJWT, jobController.getJobApplications);
router.put('/applications/:applicationId/status', authenticateJWT, jobController.updateApplicationStatus);

module.exports = router; 