import { Router } from 'express';
import { PlantController } from '../controllers/plant.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const controller = new PlantController();

// --- Swagger Documentation ---

/**
 * @swagger
 * tags:
 *   name: Plants
 *   description: Управління рослинами
 */

/**
 * @swagger
 * /api/plants:
 *   get:
 *     summary: Отримати список всіх рослин
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список рослин
 */
router.get('/', authenticate, controller.getAll);

/**
 * @swagger
 * /api/plants/floor/{floorNumber}:
 *   get:
 *     summary: Отримати рослини за номером поверху
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: floorNumber
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Список рослин на поверсі
 */
router.get('/floor/:floorNumber', authenticate, controller.getByFloor);

/**
 * @swagger
 * /api/plants/location/{locationId}:
 *   get:
 *     summary: Отримати рослини в конкретній кімнаті
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Список рослин в локації
 */
router.get('/location/:locationId', authenticate, controller.getByLocation);

/**
 * @swagger
 * /api/plants/{id}/sensors:
 *   get:
 *     summary: Отримати всі сенсори, прив'язані до рослини
 *     tags: [Plants]
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
 *         description: Список сенсорів рослини
 *       404:
 *         description: Рослину не знайдено
 */
router.get('/:id/sensors', authenticate, controller.getSensors);

/**
 * @swagger
 * /api/plants/{id}/readings:
 *   get:
 *     summary: Отримати останні показники сенсорів рослини
 *     description: Повертає список сенсорів з останніми 5 записами для кожного
 *     tags: [Plants]
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
 *         description: Дані сенсорів з історією
 *       404:
 *         description: Рослину не знайдено
 */
router.get('/:id/readings', authenticate, controller.getReadings);

/**
 * @swagger
 * /api/plants/{id}:
 *   get:
 *     summary: Отримати деталі рослини
 *     tags: [Plants]
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
 *         description: Деталі рослини
 *       404:
 *         description: Рослину не знайдено
 */
router.get('/:id', authenticate, controller.getById);

// --- Admin / Florist Actions ---

/**
 * @swagger
 * /api/plants:
 *   post:
 *     summary: Додати нову рослину (Тільки ADMIN, FLORIST)
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePlantRequest'
 *     responses:
 *       201:
 *         description: Рослина створена
 *       403:
 *         description: Недостатньо прав
 */
router.post(
  '/',
  authenticate,
  authorize(['ADMIN', 'FLORIST']),
  controller.create
);

/**
 * @swagger
 * /api/plants/{id}:
 *   put:
 *     summary: Редагувати рослину (Тільки ADMIN, FLORIST)
 *     tags: [Plants]
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
 *             $ref: '#/components/schemas/UpdatePlantRequest'
 *     responses:
 *       200:
 *         description: Рослина оновлена
 *       403:
 *         description: Недостатньо прав
 */
router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'FLORIST']),
  controller.update
);

/**
 * @swagger
 * /api/plants/{id}:
 *   delete:
 *     summary: Видалити рослину (Тільки ADMIN, FLORIST)
 *     tags: [Plants]
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
 *         description: Рослина видалена
 *       403:
 *         description: Недостатньо прав
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'FLORIST']),
  controller.delete
);

export default router;
