const express = require("express");
const { roles } = require("../consts/roles");
const { authorize } = require("../middlewares/authorize");
const authenticate = require("../middlewares/authenticate");
const validate = require("../middlewares/validate");
const { createCourseSchema } = require("../validators/courseValidator");

const {
  getCourses,
  getCourseById,
  createCourse,
} = require("../controllers/courseController");

const { getModulesByCourse } = require("../controllers/moduleController");

const router = express.Router();

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Liste des cours publiés
 *     tags:
 *       - Courses
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrer par catégorie
 *         example: Backend
 *
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filtrer par niveau
 *         example: beginner
 *
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Rechercher par titre ou description
 *         example: JavaScript
 *
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, publishedAt]
 *         description: Trier les cours
 *         example: publishedAt
 *
 *     responses:
 *       200:
 *         description: Liste des cours récupérée avec succès
 *       500:
 *         description: Erreur interne du serveur
 */
router.get("/", getCourses);

/**
 * @swagger
 * /api/courses/{id}/modules:
 *   get:
 *     summary: Liste des modules d'un cours
 *     tags:
 *       - Modules
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du cours
 *         example: 68da12345678901234567890
 *
 *     responses:
 *       200:
 *         description: Liste des modules récupérée avec succès
 *       400:
 *         description: ID du cours invalide
 *       500:
 *         description: Erreur interne du serveur
 */
router.get("/:id/modules", getModulesByCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Obtenir le détail d'un cours
 *     tags:
 *       - Courses
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du cours
 *         example: 68da12345678901234567890
 *
 *     responses:
 *       200:
 *         description: Détail du cours récupéré avec succès
 *       400:
 *         description: ID du cours invalide
 *       404:
 *         description: Cours introuvable
 *       500:
 *         description: Erreur interne du serveur
 */
router.get("/:id", getCourseById);

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a draft course
 *     description: Only trainers can create courses. The owner comes from the authenticated user; trainer, status, and other extra fields are rejected in the request body.
 *     tags:
 *       - Courses
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required: [title, description, level, category, estimatedDuration]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 description: Trimmed; must not be blank.
 *                 example: JavaScript Basics
 *               description:
 *                 type: string
 *                 minLength: 1
 *                 description: Trimmed; must not be blank.
 *                 example: Learn JavaScript fundamentals
 *               objectives:
 *                 type: array
 *                 items:
 *                   type: string
 *                   minLength: 1
 *                   description: Trimmed; must not be blank.
 *                 example: [Understand variables, Write functions]
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               category:
 *                 type: string
 *                 minLength: 1
 *                 description: Trimmed; must not be blank.
 *                 example: Development
 *               estimatedDuration:
 *                 type: number
 *                 minimum: 1
 *                 example: 60
 *     responses:
 *       201:
 *         description: Draft course created and assigned to the authenticated trainer.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Course created successfully
 *                 data:
 *                   type: object
 *                   description: Created course document, including the submitted fields and database-generated fields.
 *                   properties:
 *                     _id:
 *                       type: string
 *                     trainer:
 *                       type: string
 *                       description: Authenticated trainer's user ID.
 *                     status:
 *                       type: string
 *                       enum: [draft]
 *                     publishedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 *       400:
 *         description: Invalid or missing course fields, or unrecognized request properties. Returns JSON with status, message, and validation errors.
 *       401:
 *         description: Missing, invalid, or expired token. Returns JSON with status and message.
 *       403:
 *         description: Authenticated user is not a trainer. Returns JSON with status 403 and message Forbidden.
 *       500:
 *         description: Internal server error.
 */
router.post(
  "/",
  authenticate,
  authorize(roles.TRAINER),
  validate(createCourseSchema),
  createCourse,
);

module.exports = router;
