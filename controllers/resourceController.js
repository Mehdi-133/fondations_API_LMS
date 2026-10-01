const Resource = require("../models/Resource");

const getResourcesByModule = async (req, res) => {
  try {
    const resources = await Resource.find({
      module: req.params.id
    }).sort({ order: 1 });

    res.status(200).json({
      count: resources.length,
      data: resources
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving resources",
      error: error.message
    });
  }
};

module.exports = {
  getResourcesByModule
};