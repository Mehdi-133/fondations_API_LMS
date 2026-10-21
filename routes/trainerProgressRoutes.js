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

/**
 * @swagger
 * /api/trainer/courses:
 *   get:
 *     summary: List my trainer courses
 *     description: Lists only courses owned by the authenticated trainer, newest first.
 *     tags:
 *       - Trainer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Returns message and an array of course documents in data.
 *       '400':
 *         description: Unsupported status filter.
 *       '401':
 *         description: Missing, invalid, or expired Bearer token.
 *       '403':
 *         description: Trainer role required.
 *       '500':
 *         description: Internal server error.
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - draft
 *             - published
 *             - archived
 */
router.get("/courses",
    authenticate,
    authorize(roles.TRAINER),
    getMyCourses
);

/**
 * @swagger
 * /api/trainer/courses/{courseId}/learners:
 *   get:
 *     summary: List course learners
 *     description: >-
 *       Requires course ownership. Includes active and completed enrollments with learner name and
 *       email populated. Missing or unowned courses currently return 500 because error.status is not
 *       handled.
 *     tags:
 *       - Trainer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId.
 *     responses:
 *       '200':
 *         description: Returns message and enrollment documents in data.
 *       '400':
 *         description: Invalid course ID.
 *       '401':
 *         description: Missing, invalid, or expired Bearer token.
 *       '403':
 *         description: Trainer role required.
 *       '500':
 *         description: Internal server error.
 */
router.get(
    "/courses/:courseId/learners",
    authenticate,
    authorize(roles.TRAINER),
    getCourseLearners
);

/**
 * @swagger
 * /api/trainer/courses/{courseId}/learners/{learnerId}/progress:
 *   get:
 *     summary: View learner progress
 *     description: >-
 *       Requires course ownership and active or completed learner enrollment. Returns stored
 *       enrollment progress and current module/resource counts without recalculating the stored
 *       percentage. Missing course, ownership or enrollment currently produces 500 because
 *       error.status is not handled.
 *     tags:
 *       - Trainer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId.
 *       - in: path
 *         name: learnerId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId.
 *     responses:
 *       '200':
 *         description: >-
 *           Returns message and data containing course (id, title), learner, enrollment (status,
 *           progress), modules (total, completed, data) and resources (total, consulted).
 *       '400':
 *         description: Invalid course or learner ID.
 *       '401':
 *         description: Missing, invalid, or expired Bearer token.
 *       '403':
 *         description: Trainer role required.
 *       '500':
 *         description: Internal server error.
 */
router.get(
    "/courses/:courseId/learners/:learnerId/progress",
    authenticate,
    authorize(roles.TRAINER),
    getLearnerProgress
);

module.exports = router;
