const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate");

const {
    completeModule
} = require("../controllers/moduleProgressController");

router.post(
    "/:moduleId/complete",
    authenticate,
    completeModule
);

module.exports = router;