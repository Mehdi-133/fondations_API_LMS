
const express = require("express");
const router = express.Router();

const {
    enrollInCourse,
    getMyEnrollments
} = require("../controllers/enrollmentController");

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

module.exports = router;
