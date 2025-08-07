const express = require('express');
const router = express.Router();
const profilePhotoController = require('../controllers/profilePhotoController');
const { authenticateJWT } = require('../middlewares/auth');
const profilePhotoUpload = require('../middlewares/profilePhotoUpload');

/**
 * @swagger
 * /api/profile-photo/upload:
 *   post:
 *     summary: Upload a new profile photo
 *     tags: [Profile Photo]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Profile photo file (JPEG, PNG, GIF, WebP, max 5MB)
 *     responses:
 *       200:
 *         description: Profile photo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     photoUrl:
 *                       type: string
 *                     fileName:
 *                       type: string
 *                     profile:
 *                       type: object
 *       400:
 *         description: Invalid file or validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/upload', 
  authenticateJWT, 
  profilePhotoUpload.single('photo'), 
  profilePhotoController.uploadProfilePhoto
);

/**
 * @swagger
 * /api/profile-photo/update:
 *   put:
 *     summary: Update an existing profile photo
 *     tags: [Profile Photo]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: New profile photo file (JPEG, PNG, GIF, WebP, max 5MB)
 *     responses:
 *       200:
 *         description: Profile photo updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     photoUrl:
 *                       type: string
 *                     fileName:
 *                       type: string
 *                     profile:
 *                       type: object
 *       400:
 *         description: Invalid file or validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
router.put('/update', 
  authenticateJWT, 
  profilePhotoUpload.single('photo'), 
  profilePhotoController.updateProfilePhoto
);

/**
 * @swagger
 * /api/profile-photo/delete:
 *   delete:
 *     summary: Delete profile photo
 *     tags: [Profile Photo]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile photo deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile photo not found
 *       500:
 *         description: Server error
 */
router.delete('/delete', 
  authenticateJWT, 
  profilePhotoController.deleteProfilePhoto
);

/**
 * @swagger
 * /api/profile-photo:
 *   get:
 *     summary: Get profile photo
 *     tags: [Profile Photo]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile photo retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     hasPhoto:
 *                       type: boolean
 *                     photoUrl:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', 
  authenticateJWT, 
  profilePhotoController.getProfilePhoto
);

module.exports = router; 