const express = require("express");
const router = express.Router();

const { enrollInCourse } = require("../controllers/enrollmentController");

router.post("/courses/:courseId/enroll", enrollInCourse);

module.exports = router;