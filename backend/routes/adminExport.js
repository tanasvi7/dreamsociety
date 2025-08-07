const express = require('express');
const router = express.Router();
const adminExportController = require('../controllers/adminExportController');
const { authenticateJWT } = require('../middlewares/auth');

router.get('/export/users', authenticateJWT, adminExportController.exportUsers);
router.get('/export/payments', authenticateJWT, adminExportController.exportPayments);
router.get('/export/logs', authenticateJWT, adminExportController.exportLogs);

module.exports = router; 