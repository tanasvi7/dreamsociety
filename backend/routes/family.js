/**
 * @swagger
 * tags:
 *   name: Family
 *   description: Family member management
 */

const express = require('express');
const router = express.Router();
const familyController = require('../controllers/familyController');
const { authenticateJWT } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const Joi = require('joi');

const familySchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  relation: Joi.string().max(100).required(),
  education: Joi.string().max(255).allow('', null),
  profession: Joi.string().max(255).allow('', null)
});

/**
 * @swagger
 * /family:
 *   get:
 *     summary: Get all family members for the authenticated user
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of family members
 *   post:
 *     summary: Add a family member
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               relation:
 *                 type: string
 *               education:
 *                 type: string
 *               profession:
 *                 type: string
 *     responses:
 *       201:
 *         description: Family member created
 */
router.get('/', authenticateJWT, familyController.listFamily);
router.post('/', authenticateJWT, validate(familySchema), familyController.addFamily);

/**
 * @swagger
 * /family/{id}:
 *   put:
 *     summary: Update a family member by id
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Family member id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               relation:
 *                 type: string
 *               education:
 *                 type: string
 *               profession:
 *                 type: string
 *     responses:
 *       200:
 *         description: Family member updated
 *   delete:
 *     summary: Delete a family member by id
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Family member id
 *     responses:
 *       200:
 *         description: Family member deleted
 */
router.put('/:id', authenticateJWT, validate(familySchema), familyController.updateFamily);
router.delete('/:id', authenticateJWT, familyController.deleteFamily);

module.exports = router; 