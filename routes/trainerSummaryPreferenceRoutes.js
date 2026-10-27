const express = require("express");
const authenticate = require("../middlewares/authenticate");
const { authorize } = require("../middlewares/authorize");
const { roles } = require("../consts/roles");
const validate = require("../middlewares/validate");


const {
    getTrainerSummaryPreferences,
    updateTrainerSummaryPreferences,
}= require("../controllers/trainerSummaryPreferenceController");

const {
    
    updateTrainerSummaryPreferenceSchema,
}= require("../validators/trainerSummaryPreferenceValidator");

const router = express.Router();

router.use(authenticate, authorize(roles.TRAINER));

router.get("/", getTrainerSummaryPreferences);

router.patch(
  "/",
  validate(updateTrainerSummaryPreferenceSchema),
  updateTrainerSummaryPreferences
);

module.exports = router;

