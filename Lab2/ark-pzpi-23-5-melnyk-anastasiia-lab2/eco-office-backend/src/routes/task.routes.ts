import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const controller = new TaskController();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task planning and queue management
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     description: ADMIN/FLORIST see all tasks, others see tasks for their role only
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get('/', authenticate, controller.getAll);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get task details
 *     tags: [Tasks]
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
 *         description: Task details
 *       404:
 *         description: Not found
 */
router.get('/:id', authenticate, controller.getById);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task (ADMIN, FLORIST only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *     responses:
 *       201:
 *         description: Created
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticate, authorize(['ADMIN', 'FLORIST']), controller.create);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update task details (ADMIN, FLORIST only)
 *     tags: [Tasks]
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
 *             $ref: '#/components/schemas/UpdateTaskRequest'
 *     responses:
 *       200:
 *         description: Updated
 *       403:
 *         description: Forbidden
 */
router.put('/:id', authenticate, authorize(['ADMIN', 'FLORIST']), controller.update);

/**
 * @swagger
 * /api/tasks/{id}/status:
 *   patch:
 *     summary: Update task status
 *     description: Accessible by ADMIN, FLORIST, or assigned executor (CLEANER/MANAGER)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskStatusRequest'
 *     responses:
 *       200:
 *         description: Status updated
 *       403:
 *         description: You do not have permission to update this task status
 */
router.patch('/:id/status', authenticate, controller.updateStatus);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task (ADMIN, FLORIST only)
 *     tags: [Tasks]
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
router.delete('/:id', authenticate, authorize(['ADMIN', 'FLORIST']), controller.delete);

export default router;
