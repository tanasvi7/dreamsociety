const express = require('express');
const router = express.Router();
const bulkUploadController = require('../controllers/bulkUploadController');
const { authenticateJWT } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.post('/upload', authenticateJWT, upload.single('file'), bulkUploadController.uploadBulk);
router.get('/upload/logs', authenticateJWT, bulkUploadController.listBulkLogs);

// New route for combined user bulk upload
router.post('/upload/users', authenticateJWT, upload.single('file'), bulkUploadController.bulkUploadUsers);

module.exports = router; 