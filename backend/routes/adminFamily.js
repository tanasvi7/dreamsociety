const express = require('express');
const router = express.Router();
const { createFamilyForUser } = require('../controllers/adminFamilyController');
const { authenticateJWT } = require('../middlewares/auth');

router.post('/', authenticateJWT, createFamilyForUser);

module.exports = router; 