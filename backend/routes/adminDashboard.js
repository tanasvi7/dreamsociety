const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashboardController');
const { authenticateJWT } = require('../middlewares/auth');

/**
 * @swagger
 * /admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics (Admin only)
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
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
 *                       change:
 *                         type: string
 *                       color:
 *                         type: string
 *                       icon:
 *                         type: string
 *       403:
 *         description: Forbidden
 */
router.get('/stats', authenticateJWT, adminDashboardController.getDashboardStats);

/**
 * @swagger
 * /admin/dashboard/recent-users:
 *   get:
 *     summary: Get recent users (Admin only)
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of recent users to return
 *     responses:
 *       200:
 *         description: Recent users list
 *       403:
 *         description: Forbidden
 */
router.get('/recent-users', authenticateJWT, adminDashboardController.getRecentUsers);

/**
 * @swagger
 * /admin/dashboard/recent-jobs:
 *   get:
 *     summary: Get recent jobs (Admin only)
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of recent jobs to return
 *     responses:
 *       200:
 *         description: Recent jobs list
 *       403:
 *         description: Forbidden
 */
router.get('/recent-jobs', authenticateJWT, adminDashboardController.getRecentJobs);

/**
 * @swagger
 * /admin/dashboard/user-analytics:
 *   get:
 *     summary: Get user analytics (Admin only)
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 registrationTrend:
 *                   type: object
 *                   properties:
 *                     months:
 *                       type: array
 *                       items:
 *                         type: string
 *                     userCounts:
 *                       type: array
 *                       items:
 *                         type: integer
 *                 roleDistribution:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       role:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 verificationStatus:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       verified:
 *                         type: boolean
 *                       count:
 *                         type: integer
 *       403:
 *         description: Forbidden
 */
router.get('/user-analytics', authenticateJWT, adminDashboardController.getUserAnalytics);

/**
 * @swagger
 * /admin/dashboard/job-analytics:
 *   get:
 *     summary: Get job analytics (Admin only)
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Job analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobStatusDistribution:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 jobTypeDistribution:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 topJobsByApplications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       applications:
 *                         type: integer
 *       403:
 *         description: Forbidden
 */
router.get('/job-analytics', authenticateJWT, adminDashboardController.getJobAnalytics);

module.exports = router; 