const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate.js");
const { authorize } = require("../middlewares/authorize.js");
const {
  createQuizSchema,
  updateQuizSchema,
} = require("../validators/quizValidator.js");
const { roles } = require("../consts/roles.js");
const validate = require("../middlewares/validate.js");

const { createQuiz, updateQuiz } = require("../controllers/quizController");

router.post(
  "/",
  authenticate,
  authorize(roles.TRAINER),
  validate(createQuizSchema),
  createQuiz,
);

router.patch(
  "/:quizId",
  authenticate,
  authorize(roles.TRAINER),
  validate(updateQuizSchema),
  updateQuiz,
);

module.exports = router;
