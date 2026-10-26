const express = require("express")
const router = express.Router()

const authenticate = require("../middlewares/authenticate")
const { authorize } = require("../middlewares/authorize")
const { roles } = require("../consts/roles")
const validate = require("../middlewares/validate")
const { submitQuizAttemptSchema } = require("../validators/quizAttemptValidator")
const { submitQuizAttempt } = require("../controllers/quizAttemptController")

router.post(
    "/:quizId/attempts", 
    authenticate,
    authorize(roles.LEARNER),
    validate(submitQuizAttemptSchema),
    submitQuizAttempt
);

module.exports = router;