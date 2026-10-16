const express = require("express");
const router = express.Router();

const {
  getResourcesByModule,
  createResource,
  uploadResource,
  updateResource,
  deleteResource,
} = require("../controllers/resourceController");

const {
  markResourceAsConsulted
} = require("../controllers/resourceProgressController");

const authenticate = require("../middlewares/authenticate");
const upload = require("../middlewares/upload");
const { authorize } = require("../middlewares/authorize");
const { roles } = require("../consts/roles");
const validate = require("../middlewares/validate");
const { createResourceSchema } = require("../validators/resourceValidator");

/**
 * @swagger
 * /api/modules/{id}/resources/upload:
 *   post:
 *     summary: Upload a file linked to a module
 *     description: Requires an authenticated trainer. Accepts one file using its declared PDF, JPEG or PNG MIME type, up to 5242880 bytes (5 MiB). Stores the file locally and creates a document resource with its original name, size and module link. The returned URL field is a storage path, not a public download URL. This route checks the trainer role but does not check course ownership.
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of an existing module.
 *         schema:
 *           type: string
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required: [file, order]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: One PDF, JPEG or PNG file, maximum 5242880 bytes.
 *               order:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *                 description: Positive integer; form-data text is converted to a number.
 *     responses:
 *       201:
 *         description: File stored and resource created.
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
 *                   example: Resource uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     module:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [document]
 *                     url:
 *                       type: string
 *                       description: Local file storage path.
 *                       example: uploads/550e8400-e29b-41d4-a716-446655440000.pdf
 *                     originalName:
 *                       type: string
 *                       example: lesson.pdf
 *                     size:
 *                       type: integer
 *                       description: File size in bytes.
 *                       example: 1024
 *                     order:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Missing file, unsupported declared MIME type, invalid module ID, invalid order or extra text fields. Returns JSON with status and message.
 *       401:
 *         description: Missing, invalid or expired Bearer token.
 *       403:
 *         description: Authenticated user is not a trainer.
 *       404:
 *         description: Module not found. The uploaded file is removed.
 *       413:
 *         description: File exceeds the size limit.
 *         content:
 *           application/json:
 *             example:
 *               status: 413
 *               message: File must not exceed 5 MB
 *       500:
 *         description: Internal storage or database error. Other unhandled multipart errors currently also return 500.
 */
router.post(
  "/:id/resources/upload",
  authenticate,
  authorize(roles.TRAINER),
  upload.single("file"),
  uploadResource,
);

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
  authenticate,
  authorize(roles.TRAINER),
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
  authenticate,
  authorize(roles.TRAINER),
  updateResource,
);

/**
 * @swagger
 * /api/modules/{id}/resources/{resourceId}:
 *   delete:
 *     summary: Delete a resource without learner progress
 *     description: Only authenticated trainers can delete a resource. The resource must belong to the specified module and have no associated learner progress. No request body is required. This endpoint checks the trainer role but does not check course ownership.
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Missing, invalid, or expired Bearer token. Returns JSON with status and message.
 *       403:
 *         description: Authenticated user is not a trainer. Returns JSON with status 403 and message Forbidden.
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
router.delete(
  "/:id/resources/:resourceId",
  authenticate,
  authorize(roles.TRAINER),
  deleteResource,
);

router.post(
  "/:resourceId/consult",
  authenticate,
  markResourceAsConsulted
);

module.exports = router;
