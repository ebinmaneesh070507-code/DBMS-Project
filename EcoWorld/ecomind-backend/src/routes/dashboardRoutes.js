const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getStats, getCharts, getInsights, getMyStats } = require("../controllers/dashboardController");

const router = express.Router();

// City-wide analytics are visible to any signed-in user (admin or viewer).
router.use(protect);

router.get("/stats", getStats);
router.get("/charts", getCharts);
router.get("/insights", getInsights);
// A viewer's personal contribution summary (their own reports + scans).
router.get("/my-stats", getMyStats);

module.exports = router;
