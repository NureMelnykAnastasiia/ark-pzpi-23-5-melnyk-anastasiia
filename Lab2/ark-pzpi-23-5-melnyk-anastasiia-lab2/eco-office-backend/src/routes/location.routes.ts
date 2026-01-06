import { Router } from 'express';
import { LocationController } from '../controllers/location.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const controller = new LocationController();

/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: Office rooms and zones management
 */

/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: Get all locations
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of locations with plants
 */
router.get('/', authenticate, controller.getAll);

/**
 * @swagger
 * /api/locations/{id}:
 *   get:
 *     summary: Get location details
 *     tags: [Locations]
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
 *         description: Location details
 *       404:
 *         description: Not found
 */
router.get('/:id', authenticate, controller.getById);

/**
 * @swagger
 * /api/locations:
 *   post:
 *     summary: Create a new location (ADMIN, OFFICE_MANAGER only)
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLocationRequest'
 *     responses:
 *       201:
 *         description: Created
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticate, authorize(['ADMIN', 'OFFICE_MANAGER']), controller.create);

/**
 * @swagger
 * /api/locations/{id}:
 *   put:
 *     summary: Update location (ADMIN, OFFICE_MANAGER only)
 *     tags: [Locations]
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
 *             $ref: '#/components/schemas/UpdateLocationRequest'
 *     responses:
 *       200:
 *         description: Updated
 *       403:
 *         description: Forbidden
 */
router.put('/:id', authenticate, authorize(['ADMIN', 'OFFICE_MANAGER']), controller.update);

/**
 * @swagger
 * /api/locations/{id}:
 *   delete:
 *     summary: Delete a location (ADMIN, OFFICE_MANAGER only)
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', authenticate, authorize(['ADMIN', 'OFFICE_MANAGER']), controller.delete);

export default router;
