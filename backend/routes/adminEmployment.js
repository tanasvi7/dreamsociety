const express = require('express');
const router = express.Router();
const { createEmploymentForUser } = require('../controllers/adminEmploymentController');
const { authenticateJWT } = require('../middlewares/auth');

router.post('/', authenticateJWT, createEmploymentForUser);

module.exports = router; 