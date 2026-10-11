const ResourceProgress = require("../models/ResourceProgress");
const Resource = require("../models/Resource");

const markResourceAsConsulted = async (req, res, next) => {
    try {
        const { resourceId } = req.params;

        // fake 
        const learnerId = "REMPLACE_PAR_UN_ID_USER_VALIDE";

        // verifier que la ressource existe
        const resource = await Resource.findById(resourceId);

        if (!resource) {
            return res.status(404).json({
                message: "Ressource introuvable"
            });
        }

        // verifier si la ressource consultée
        const existingProgress = await ResourceProgress.findOne({
            learner: learnerId,
            resource: resourceId
        });

        if (existingProgress) {
            return res.status(200).json({
                message: "Ressource déjà consultée",
                data: existingProgress
            });
        }

        // créer la progression
        const progress = await ResourceProgress.create({
            learner: learnerId,
            resource: resourceId,
            consulted: true,
            consultedAt: new Date()
        });

        return res.status(201).json({
            message: "Ressource marquée comme consultée",
            data: progress
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    markResourceAsConsulted
};