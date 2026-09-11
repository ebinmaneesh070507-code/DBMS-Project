const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { getTeams } = require("../controllers/teamsController");

const router = express.Router();

router.get("/", protect, authorize("admin"), getTeams);

module.exports = router;
