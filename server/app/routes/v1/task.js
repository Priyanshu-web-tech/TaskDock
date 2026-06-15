const router = require("express").Router();
const schema = require("../../validation/validation");
const controller = require("../../controllers/taskController");
const { validate, verifyAuthToken } = require("../../middlewares/index");

/**
 * @swagger
 * /v1/tasks:
 *   post:
 *     summary: Create a new task
 *     description: Creates a task for the authenticated user.
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Task One - Buy Groceries
 *               description:
 *                 type: string
 *                 example: Buy milk, eggs, bread
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, completed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  verifyAuthToken,
  validate(schema.createTask),
  controller.createTask
);

/**
 * @swagger
 * /v1/tasks:
 *   get:
 *     summary: List tasks
 *     description: Returns tasks with filtering, search, sorting and pagination.
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in_progress, completed]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [dueDate, priority, createdAt]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  verifyAuthToken,
  validate(schema.getTasksQuery, "query"),
  controller.getTasks
);

/**
 * @swagger
 * /v1/tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     description: Retrieve a specific task belonging to the authenticated user.
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/:id",
  verifyAuthToken,
  validate(schema.taskIdParam, "params"),
  controller.getTaskById
);

/**
 * @swagger
 * /v1/tasks/{id}:
 *   patch:
 *     summary: Update task
 *     description: Update one or more fields of an existing task.
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, completed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/:id",
  verifyAuthToken,
  validate(schema.taskIdParam, "params"),
  validate(schema.updateTask),
  controller.updateTask
);

/**
 * @swagger
 * /v1/tasks/{id}:
 *   delete:
 *     summary: Delete task
 *     description: Soft delete a task belonging to the authenticated user.
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 */
router.delete(
  "/:id",
  verifyAuthToken,
  validate(schema.taskIdParam, "params"),
  controller.deleteTask
);

module.exports  = router