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

// Get subscription status
router.get('/subscription/status', authenticateJWT, userController.getSubscriptionStatus);
// Get all members for network component
router.get('/members', authenticateJWT, userController.getAllMembers);
// Get filter options for network search
router.get('/network/filter-options', authenticateJWT, userController.getNetworkFilterOptions);
// Get network member profile (allows authenticated members to view other members)
router.get('/network/:id', authenticateJWT, userController.getNetworkMemberProfile);
// These routes must come after the specific routes to avoid conflicts
router.get('/:id', authenticateJWT, userController.getUserById);
router.put('/:id', authenticateJWT, validate(updateUserSchema), userController.updateUserById);

module.exports = router; 