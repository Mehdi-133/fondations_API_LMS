const express = require("express");

const {
    getCourses,
    getCourseById
} = require("../controllers/courseController");

const {
    getModulesByCourse
} = require("../controllers/moduleController");

const router = express.Router();

router.get("/", getCourses);

router.get("/:id/modules", getModulesByCourse);

router.get("/:id", getCourseById);

module.exports = router;