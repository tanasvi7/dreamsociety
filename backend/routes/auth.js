const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middlewares/auth');
const { loginLimiter, registrationLimiter, otpLimiter } = require('../middlewares/rateLimit');

/**
 * @swagger
 * /auth/check-availability:
 *   get:
 *     summary: Check if email or phone is available
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Email to check
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: Phone to check
 *     responses:
 *       200:
 *         description: Availability check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                 conflicts:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get('/check-availability', authController.checkAvailability);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
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
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post('/register', registrationLimiter, authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', loginLimiter, authController.login);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP
 */
router.post('/verify-otp', otpLimiter, authController.verifyOtp);

/**
 * @swagger
 * /auth/resend-otp:
 *   post:
 *     summary: Resend OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       400:
 *         description: Invalid request
 */
router.post('/resend-otp', otpLimiter, authController.resendOtp);

// Test endpoint to check admin user (for debugging)
router.get('/test-admin', authController.testAdminUser);

// Test endpoint for email service
router.post('/test-email', authController.testEmailService);

/**
 * @swagger
 * /auth/clear-pending-registration:
 *   post:
 *     summary: Clear pending registration for an email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pending registration cleared successfully
 *       400:
 *         description: Invalid request
 */
router.post('/clear-pending-registration', authController.clearPendingRegistration);

/**
 * @swagger
 * /auth/token-info:
 *   get:
 *     summary: Get current token information
 *     description: Returns information about the current user and impersonation status
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     full_name:
 *                       type: string
 *                 is_impersonated:
 *                   type: boolean
 *                 impersonated_by:
 *                   type: integer
 *                   nullable: true
 *                 impersonated_at:
 *                   type: string
 *                   nullable: true
 *       401:
 *         description: Unauthorized
 */
router.get('/token-info', authenticateJWT, authController.getTokenInfo);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     full_name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticateJWT, authController.getMe);

module.exports = router;