const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateJWT } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticateJWT);

// Get user notifications
router.get('/', notificationController.getUserNotifications);

// Get notification count for navbar
router.get('/count', notificationController.getNotificationCount);

// Mark notification as read
router.patch('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
