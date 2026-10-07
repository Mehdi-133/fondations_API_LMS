const express = require("express");
const { register } = require("../controllers/authController");
const validate = require("../middlewares/validate");
const { registerSchema } = require("../validators/authValidator");

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Create a learner account
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
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: learner@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: password123
 *     responses:
 *       201:
 *         description: Account created successfully
 *       400:
 *         description: Invalid registration data
 *       409:
 *         description: Email already registered
 *       500:
 *         description: Internal server error
 */
router.post("/register", validate(registerSchema), register);

module.exports = router;
