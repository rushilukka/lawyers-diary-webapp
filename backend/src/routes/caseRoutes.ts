import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
    getCases,
    createCase,
    getCaseById,
    updateCase,
    deleteCase
} from '../controllers/caseController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cases
 *   description: Case management
 */

/**
 * @swagger
 * /api/cases:
 *   get:
 *     summary: Get all cases for logged in lawyer
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cases
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Case'
 *   post:
 *     summary: Create a new case
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
  *           schema:
  *             $ref: '#/components/schemas/CaseInput'
 *     responses:
 *       201:
 *         description: Case created
 *       400:
 *         description: Bad request
 */
router.route('/')
    .get(protect, getCases)
    .post(protect, createCase);

/**
 * @swagger
 * /api/cases/{id}:
 *   get:
 *     summary: Get case by ID
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Case details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Case'
 *       404:
 *         description: Case not found
 *   put:
 *     summary: Update a case
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CaseInput'
 *     responses:
 *       200:
 *         description: Case updated
 *       404:
 *         description: Case not found
 *   delete:
 *     summary: Soft delete a case
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Case deleted
 *       404:
 *         description: Case not found
 */
router.route('/:id')
    .get(protect, getCaseById)
    .put(protect, updateCase)
    .delete(protect, deleteCase);

export default router;
