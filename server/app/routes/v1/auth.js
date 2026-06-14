const router = require("express").Router();
const schema = require("../../validation/validation");
const controller = require("../../controllers/authController");
const { validate, verifyAuthToken, verifyOtpToken } = require("../../middlewares/index");

/**
 * @swagger
 * /v1/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate a user with email and password. Returns JWT tokens set as cookies and in the response body.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - deviceId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@user.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *               deviceId:
 *                 type: string
 *                 description: A unique identifier for the browser/device (UUID stored in localStorage). Ensures each browser maintains an independent session for the same user.
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         userType:
 *                           type: string
 *                           enum: [admin, user]
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Invalid credentials or account suspended/deleted.
 *       404:
 *         description: User not found.
 */
router.post("/login", validate(schema.login), controller.login);

/**
 * @swagger
 * /v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a user account. Role is hardcoded as "user". Returns JWT tokens on success.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - deviceId
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@user.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *                 description: Min 8 chars, must include uppercase, lowercase, number, and special character.
 *               deviceId:
 *                 type: string
 *                 description: A unique identifier for the browser/device (UUID stored in localStorage). Ensures each browser maintains an independent session for the same user.
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         userType:
 *                           type: string
 *                           example: user
 *       400:
 *         description: Validation error.
 *       409:
 *         description: User already exists.
 *       500:
 *         description: Internal server error.
 */
router.post("/register", validate(schema.register), controller.register);

module.exports = router;

