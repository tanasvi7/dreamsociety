const express = require('express');
const router = express.Router();
const { createProfileForUser } = require('../controllers/adminProfileController');
const { authenticateJWT } = require('../middlewares/auth');

router.post('/', authenticateJWT, createProfileForUser);

module.exports = router; 