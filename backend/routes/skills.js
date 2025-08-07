const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { authenticateJWT } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const Joi = require('joi');

const skillSchema = Joi.object({
  skill_name: Joi.string().max(100).required()
});

router.get('/', authenticateJWT, skillController.listSkills);
router.post('/', authenticateJWT, validate(skillSchema), skillController.addSkill);
router.put('/:id', authenticateJWT, validate(skillSchema), skillController.updateSkill);
router.delete('/:id', authenticateJWT, skillController.deleteSkill);
router.post('/endorse/:id', authenticateJWT, skillController.endorseSkill);

module.exports = router; 