
const express = require("express");

const authenticate = require("../middlewares/authenticate");
const { authorize } = require("../middlewares/authorize");
const { roles } = require("../consts/roles");
const validate = require("../middlewares/validate");

const {
    createNotificationConfig,
    getNotificationConfig,
    updateNotificationConfig,
    deleteNotificationConfig,
    listJobExecutions,
} = require("../controllers/notificationConfigController");

const {
    createNotificationConfigSchema,
    updateNotificationConfigSchema,
} = require("../validators/notificationConfigValidator");

const router = express.Router();

router.use(authenticate, authorize(roles.ADMIN));

router.post(
    "/notifications",
    validate(createNotificationConfigSchema),
    createNotificationConfig
);

router.get("/notifications", getNotificationConfig);

router.patch(
    "/notifications",
    validate(updateNotificationConfigSchema),
    updateNotificationConfig
);

router.delete("/notifications", deleteNotificationConfig);

router.get("/job-executions", listJobExecutions);

module.exports = router;
