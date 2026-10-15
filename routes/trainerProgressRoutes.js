const express = require("express");

const authenticate = require("../middlewares/authenticate");
const { authorize } = require("../middlewares/authorize");
const { roles } = require("../consts/roles");


const {
    getMyCourses,
    getCourseLearners,
    getLearnerProgress
} = require("../controllers/trainerProgressController");

const router = express.Router();

router.get("/courses",
    authenticate,
    authorize(roles.TRAINER),
    getMyCourses
);

router.get(
    "/courses/:courseId/learners",
    authenticate,
    authorize(roles.TRAINER),
    getCourseLearners
);

router.get(
    "/courses/:courseId/learners/:learnerId/progress",
    authenticate,
    authorize(roles.TRAINER),
    getLearnerProgress
);

module.exports = router;
