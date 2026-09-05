const express = require("express");
const { getStats, getCharts, getInsights } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Aggregate, city-wide analytics — available to any signed-in user
// (citizens/viewers as well as admins). Per-report, per-area raw detail
// lives behind the admin-only GET /api/reports instead.
router.use(protect);

router.get("/stats", getStats);
router.get("/charts", getCharts);
router.get("/insights", getInsights);

module.exports = router;
