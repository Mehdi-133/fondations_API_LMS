
const express = require("express");
const router = express.Router();

const {
    enrollInCourse,
    getMyEnrollments
} = require("../controllers/enrollmentController");

const {
    getCourseProgress
} = require("../controllers/courseProgressController");

const authenticate = require("../middlewares/authenticate");

router.post(
    "/courses/:courseId/enroll",
    authenticate,
    enrollInCourse
);

router.get(
    "/enrollments/me",
    authenticate,
    getMyEnrollments
);

router.get(
    "/courses/:courseId/progress",
    authenticate,
    getCourseProgress
);

module.exports = router;
