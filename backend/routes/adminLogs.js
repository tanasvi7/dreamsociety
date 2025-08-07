const express = require('express');
const router = express.Router();
const adminLogController = require('../controllers/adminLogController');
const { authenticateJWT } = require('../middlewares/auth');

router.get('/logs', authenticateJWT, adminLogController.listAdminLogs);

module.exports = router; 