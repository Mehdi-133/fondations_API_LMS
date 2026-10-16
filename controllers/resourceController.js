const Resource = require("../models/Resource");
const Module = require("../models/Module");
const ResourceProgress = require("../models/ResourceProgress");
const { unlink } = require("fs/promises");
const { uploadResourceSchema } = require("../validators/resourceValidator");

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

const createResource = async (req, res, next) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) {
      const error = new Error("Module not found");
      error.statusCode = 404;
      return next(error);
    }

    const { type, url, order } = req.body;
    const resource = await Resource.create({
      module: module._id,
      type,
      url,
      order,
    });

    res.status(201).json({
      status: 201,
      message: "Resource created successfully",
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

const uploadResource = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error("No file uploaded");
      error.statusCode = 400;
      return next(error);
    }

    const result = uploadResourceSchema.safeParse(req.body);
    if (!result.success) {
      const error = new Error("Validation error");
      error.statusCode = 400;
      throw error;
    }

    const module = await Module.findById(req.params.id);
    if (!module) {
      const error = new Error("Module not found");
      error.statusCode = 404;
      throw error;
    }

    const resource = await Resource.create({
      module: module._id,
      type: "document",
      url: req.file.path,
      originalName: req.file.originalname,
      size: req.file.size,
      order: result.data.order,
    });

    res.status(201).json({
      status: 201,
      message: "Resource uploaded successfully",
      data: resource,
    });
  } catch (error) {
    if (req.file) {
      try {
        await unlink(req.file.path);
      } catch (cleanupError) {
        if (cleanupError.code !== "ENOENT") {
          console.error("Failed to remove uploaded file:", cleanupError);
        }
      }
    }

    next(error);
  }
};

const updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.resourceId,
      module: req.params.id,
    });
    if (!resource) {
      const error = new Error("Resource not found in this module");
      error.statusCode = 404;
      return next(error);
    }

    const { type, url, order } = req.body;
    resource.type = type;
    resource.url = url;
    resource.order = order;
    await resource.save();

    res.status(200).json({
      status: 200,
      message: "Resource updated successfully",
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.resourceId,
      module: req.params.id,
    });
    if (!resource) {
      const error = new Error("Resource not found in this module");
      error.statusCode = 404;
      return next(error);
    }

    const hasProgress = await ResourceProgress.exists({ resource: resource._id });
    if (hasProgress) {
      const error = new Error("Cannot delete resource with associated learner progress");
      error.statusCode = 409;
      return next(error);
    }

    await resource.deleteOne();
    res.status(200).json({
      status: 200,
      message: "Resource deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResourcesByModule,
  createResource,
  uploadResource,
  updateResource,
  deleteResource,
};
