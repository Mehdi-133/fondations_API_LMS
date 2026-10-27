const express = require("express");
const router = express.Router();

const {
  createFeedback,
  getFeedback,
  updateFeedback,
} = require("../controllers/feedbackController");
const authenticate = require("../middlewares/authenticate");
const { authorize } = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const {
  createFeedbackSchema,
  updateFeedbackSchema,
} = require("../validators/feedbackValidator");
const { roles } = require("../consts/roles");

router.post(
  "/",
  authenticate,
  authorize(roles.TRAINER),
  validate(createFeedbackSchema),
  createFeedback,
);

router.get(
  "/:feedbackId",
  authenticate,
  authorize(roles.TRAINER, roles.LEARNER, roles.ADMIN),
  getFeedback,
);

router.patch(
  "/:feedbackId",
  authenticate,
  authorize(roles.TRAINER, roles.ADMIN),
  validate(updateFeedbackSchema),
  updateFeedback,
);

module.exports = router;
