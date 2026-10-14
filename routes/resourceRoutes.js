const express = require("express");
const router = express.Router();

const {
  getResourcesByModule,
  createResource,
  updateResource,
  deleteResource,
} = require("../controllers/resourceController");

const {
  markResourceAsConsulted
} = require("../controllers/resourceProgressController");

const authenticate = require("../middlewares/authenticate");
const validate = require("../middlewares/validate");
const { createResourceSchema } = require("../validators/resourceValidator");

/**
 * @swagger
 * /api/modules/{id}/resources:
 *   get:
 *     summary: Liste les ressources d'un module
 *     tags:
 *       - Resources
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du module
 *         example: 68da12345678901234567890
 *
 *     responses:
 *       200:
 *         description: Liste des ressources récupérée avec succès
 *
 *       400:
 *         description: ID du module invalide
 *
 *       404:
 *         description: Module introuvable
 *
 *       500:
 *         description: Erreur interne du serveur
 */
router.get("/:id/resources", getResourcesByModule);


/**
 * @swagger
 * /api/modules/{id}/resources:
 *   post:
 *     summary: Create a resource linked to a module
 *     description: Creates a resource using an existing HTTP or HTTPS URL. The module must exist and its ID comes from the path. Extra body fields are rejected. File upload and route protection are separate tasks; this endpoint currently requires no authentication.
 *     tags: [Resources]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of an existing module.
 *         schema:
 *           type: string
 *         example: 6acf72f60636619e9986eb73
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required: [type, url, order]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [video, document, link]
 *               url:
 *                 type: string
 *                 format: uri
 *                 pattern: '^https?://'
 *                 description: Valid HTTP or HTTPS URL of the resource.
 *               order:
 *                 type: integer
 *                 minimum: 1
 *           example:
 *             type: link
 *             url: https://example.com/javascript
 *             order: 1
 *     responses:
 *       201:
 *         description: Resource created and linked to the module.
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
 *                   example: Resource created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     module:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [video, document, link]
 *                     url:
 *                       type: string
 *                     order:
 *                       type: integer
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid module ID (Invalid ID), or invalid, missing, or extra body fields (Validation error). Body validation errors include an errors array with field and message.
 *         content:
 *           application/json:
 *             examples:
 *               invalidId:
 *                 value:
 *                   status: 400
 *                   message: Invalid ID
 *               invalidBody:
 *                 value:
 *                   status: 400
 *                   message: Validation error
 *                   errors:
 *                     - field: url
 *                       message: Invalid URL
 *       404:
 *         description: Module does not exist.
 *         content:
 *           application/json:
 *             example:
 *               status: 404
 *               message: Module not found
 *       500:
 *         description: Internal server error.
 */
router.post(
  "/:id/resources",
  validate(createResourceSchema),
  createResource,
);
/**
 * @swagger
 * /api/modules/{id}/resources/{resourceId}:
 *   put:
 *     summary: Update a resource in a module
 *     description: Updates type, URL, and order. All three fields are required. The resource must belong to the module in the path; its module cannot be changed. No file upload. Authentication and access protection are planned separately.
 *     tags: [Resources]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Module MongoDB ObjectId.
 *         schema:
 *           type: string
 *       - in: path
 *         name: resourceId
 *         required: true
 *         description: Resource MongoDB ObjectId.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required: [type, url, order]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [video, document, link]
 *               url:
 *                 type: string
 *                 format: uri
 *                 pattern: '^https?://'
 *               order:
 *                 type: integer
 *                 minimum: 1
 *           example:
 *             type: link
 *             url: https://example.com/javascript-updated
 *             order: 2
 *     responses:
 *       200:
 *         description: Resource updated successfully; returns status, message, and the updated resource in data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Resource updated successfully
 *                 data:
 *                   type: object
 *                   description: Updated resource document, including its unchanged module ID and database-generated fields.
 *             example:
 *               status: 200
 *               message: Resource updated successfully
 *               data:
 *                 _id: 6acf73750636619e9986eb74
 *                 module: 6acf7246dbc118977e2babee
 *                 type: link
 *                 url: https://example.com/javascript-updated
 *                 order: 2
 *       400:
 *         description: Invalid ID or invalid, missing, or extra body fields. Returns status and message; body validation errors include errors.
 *       404:
 *         description: Resource does not exist or belongs to another module.
 *         content:
 *           application/json:
 *             example:
 *               status: 404
 *               message: Resource not found in this module
 *       500:
 *         description: Internal server error.
 */
router.put(
  "/:id/resources/:resourceId",
  validate(createResourceSchema),
  updateResource,
);

/**
 * @swagger
 * /api/modules/{id}/resources/{resourceId}:
 *   delete:
 *     summary: Delete a resource without learner progress
 *     description: Permanently deletes a resource belonging to the specified module only when no learner progress references it. No request body is required. Authentication and access protection are planned separately.
 *     tags: [Resources]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Module MongoDB ObjectId.
 *         schema:
 *           type: string
 *       - in: path
 *         name: resourceId
 *         required: true
 *         description: Resource MongoDB ObjectId.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resource permanently deleted.
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               message: Resource deleted successfully
 *       400:
 *         description: Invalid module or resource ID. Returns status 400 and message Invalid ID.
 *       404:
 *         description: Resource does not exist or belongs to another module.
 *         content:
 *           application/json:
 *             example:
 *               status: 404
 *               message: Resource not found in this module
 *       409:
 *         description: Resource has associated learner progress; nothing is deleted.
 *         content:
 *           application/json:
 *             example:
 *               status: 409
 *               message: Cannot delete resource with associated learner progress
 *       500:
 *         description: Internal server error.
 */
router.delete("/:id/resources/:resourceId", deleteResource);

router.post(
  "/:resourceId/consult",
  authenticate,
  markResourceAsConsulted
);

module.exports = router;
