const express = require("express");
const { getStats, getCharts, getInsights } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/stats", getStats);
router.get("/charts", getCharts);
router.get("/insights", getInsights);

module.exports = router;
