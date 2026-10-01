const express = require("express");
const router = express.Router();

const {
  getResourcesByModule
} = require("../controllers/resourceController");

router.get("/:id/resources", getResourcesByModule);

// router.get("/:id/resources", (req, res) => {
//     res.json({
//         message: "Resource route is working"
//     });
// });

module.exports = router;