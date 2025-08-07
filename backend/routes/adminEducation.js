const express = require('express');
const router = express.Router();
const { createEducationForUser } = require('../controllers/adminEducationController');
const { authenticateJWT } = require('../middlewares/auth');

router.post('/admin/education', authenticateJWT, createEducationForUser);

module.exports = router;