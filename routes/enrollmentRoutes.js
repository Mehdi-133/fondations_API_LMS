const express = require("express");
const router = express.Router();

const { enrollInCourse } = require("../controllers/enrollmentController");
const authenticate = require("../middlewares/authenticate");

router.post("/courses/:courseId/enroll", authenticate, enrollInCourse);

module.exports = router;