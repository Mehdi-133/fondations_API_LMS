const Module = require("../models/Module");

const getModulesByCourse = async (req, res, next) => {
    try {
        const modules = await Module.find({
            course: req.params.id,
            status: "published"
        }).sort({ order: 1 });

        res.status(200).json({
            count: modules.length,
            data: modules
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getModulesByCourse
};