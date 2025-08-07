const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const Joi = require('joi');

const updateUserSchema = Joi.object({
  full_name: Joi.string().min(2).max(255),
  email: Joi.string().email(),
  phone: Joi.string().min(8).max(20),
  role: Joi.string().valid('member', 'admin', 'moderator')
});

// Get all members for network component
router.get('/members', authenticateJWT, userController.getAllMembers);
router.get('/:id', authenticateJWT, userController.getUserById);
router.put('/:id', authenticateJWT, validate(updateUserSchema), userController.updateUserById);

module.exports = router; 