const express = require("express");
const router = express.Router();

const {
  getResourcesByModule
} = require("../controllers/resourceController");



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

module.exports = router;