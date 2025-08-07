const express = require('express');
const router = express.Router();
const memberDashboardController = require('../controllers/memberDashboardController');
const { authenticateJWT } = require('../middlewares/auth');

/**
 * @swagger
 * /member/dashboard/stats:
 *   get:
 *     summary: Get member dashboard statistics
 *     tags: [Member Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Member dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       label:
 *                         type: string
 *                       value:
 *                         type: string
 *                       icon:
 *                         type: string
 *                       color:
 *                         type: string
 *       403:
 *         description: Forbidden
 */
router.get('/stats', authenticateJWT, memberDashboardController.getMemberDashboardStats);

/**
 * @swagger
 * /member/dashboard/profile-completion:
 *   get:
 *     summary: Get member profile completion percentage
 *     tags: [Member Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile completion percentage
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profileComplete:
 *                   type: integer
 *                   description: Profile completion percentage (0-100)
 *       403:
 *         description: Forbidden
 */
router.get('/profile-completion', authenticateJWT, memberDashboardController.getProfileCompletion);

/**
 * @swagger
 * /member/dashboard/recent-activities:
 *   get:
 *     summary: Get recent activities for member
 *     tags: [Member Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of recent activities to return
 *     responses:
 *       200:
 *         description: Recent activities list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       text:
 *                         type: string
 *                       time:
 *                         type: string
 *       403:
 *         description: Forbidden
 */
router.get('/recent-activities', authenticateJWT, memberDashboardController.getRecentActivities);

/**
 * @swagger
 * /member/dashboard/recommended-jobs:
 *   get:
 *     summary: Get recommended jobs for member
 *     tags: [Member Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of recommended jobs to return
 *     responses:
 *       200:
 *         description: Recommended jobs list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       company:
 *                         type: string
 *                       location:
 *                         type: string
 *                       salary:
 *                         type: string
 *                       type:
 *                         type: string
 *       403:
 *         description: Forbidden
 */
router.get('/recommended-jobs', authenticateJWT, memberDashboardController.getRecommendedJobs);

/**
 * @swagger
 * /member/dashboard/analytics:
 *   get:
 *     summary: Get member analytics data
 *     tags: [Member Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Member analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 successRate:
 *                   type: integer
 *                   description: Application success rate percentage
 *                 endorsementRate:
 *                   type: integer
 *                   description: Skill endorsement rate percentage
 *                 totalApplications:
 *                   type: integer
 *                 acceptedApplications:
 *                   type: integer
 *                 applicationTrend:
 *                   type: object
 *                   properties:
 *                     months:
 *                       type: array
 *                       items:
 *                         type: string
 *                     applicationCounts:
 *                       type: array
 *                       items:
 *                         type: integer
 *                 topSkills:
 *                   type: array
 *                   items:
 *                     type: string
 *       403:
 *         description: Forbidden
 */
router.get('/analytics', authenticateJWT, memberDashboardController.getMemberAnalytics);

/**
 * @swagger
 * /member/dashboard/membership-status:
 *   get:
 *     summary: Get member membership status
 *     tags: [Member Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Membership status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isPremium:
 *                   type: boolean
 *                 membershipType:
 *                   type: string
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *       403:
 *         description: Forbidden
 */
router.get('/membership-status', authenticateJWT, memberDashboardController.getMembershipStatus);

module.exports = router; 