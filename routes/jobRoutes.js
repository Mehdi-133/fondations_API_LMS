
const express = require("express");
const { runJobManually } = require("../controllers/jobController");
const authenticate = require("../middlewares/authenticate");
const { authorize } = require("../middlewares/authorize");
const { roles } = require("../consts/roles");

const router = express.Router();

router.use(authenticate, authorize(roles.ADMIN));

router.post(
    "/inactive-reminders/run",
    (req, res, next) => {
        req.params.jobName = "inactiveLearnerReminder";
        runJobManually(req, res, next);
    }
);

router.post(
    "/trainer-summary/run",
    (req, res, next) => {
        req.params.jobName = "trainerSummary";
        runJobManually(req, res, next);
    }
);

router.post(
    "/stats/run",
    (req, res, next) => {
        req.params.jobName = "statsRefresh";
        runJobManually(req, res, next);
    }
);

router.post("/:jobName/run", runJobManually);

module.exports = router;
