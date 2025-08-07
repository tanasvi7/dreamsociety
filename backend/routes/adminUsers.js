const express = require('express');
const router = express.Router();
const adminUsersController = require('../controllers/adminUsersController');
const { authenticateJWT } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const Joi = require('joi');

const userSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\+?[\d\s-]+$/).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('member', 'admin', 'moderator').default('member')
});

const updateUserSchema = Joi.object({
  full_name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  phone: Joi.string().pattern(/^\+?[\d\s-]+$/),
  role: Joi.string().valid('member', 'admin', 'moderator')
});

const passwordSchema = Joi.object({ password: Joi.string().min(6).required() });
const roleSchema = Joi.object({ role: Joi.string().valid('member', 'admin', 'moderator').required() });

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, email, or phone
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Forbidden
 */
router.get('/users', authenticateJWT, adminUsersController.listUsers);

/**
 * @swagger
 * /admin/users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [member, admin, moderator]
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 */
router.post('/users', authenticateJWT, validate(userSchema), adminUsersController.createUser);

/**
 * @swagger
 * /admin/users/full:
 *   post:
 *     summary: Create a new user with full profile (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [member, admin, moderator]
 *     responses:
 *       201:
 *         description: User created with full profile
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 */
router.post('/users/full', authenticateJWT, adminUsersController.createFullUser);

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Update a user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [member, admin, moderator]
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.put('/users/:id', authenticateJWT, validate(updateUserSchema), adminUsersController.updateUser);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete a user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.delete('/users/:id', authenticateJWT, adminUsersController.deleteUser);

/**
 * @swagger
 * /admin/users/{id}/reset-password:
 *   post:
 *     summary: Reset user password (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.post('/users/:id/reset-password', authenticateJWT, validate(passwordSchema), adminUsersController.resetPassword);

/**
 * @swagger
 * /admin/users/{id}/change-role:
 *   post:
 *     summary: Change user role (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [member, admin, moderator]
 *     responses:
 *       200:
 *         description: Role changed
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.post('/users/:id/change-role', authenticateJWT, validate(roleSchema), adminUsersController.changeRole);

/**
 * @swagger
 * /admin/impersonate:
 *   post:
 *     summary: Impersonate a user (Admin only)
 *     description: Generate a JWT token for any user, allowing admin to act as that user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID of the user to impersonate
 *     responses:
 *       200:
 *         description: Impersonation successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                   description: JWT token for the impersonated user
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     full_name:
 *                       type: string
 *                     role:
 *                       type: string
 *                     impersonated_by:
 *                       type: integer
 *                     impersonated_at:
 *                       type: string
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.post('/impersonate', authenticateJWT, adminUsersController.impersonateUser);

module.exports = router; 