const express = require("express");
const { ask } = require("../controllers/assistantController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// The database assistant answers over the FULL dataset (all zones, all
// citizens' reports), so it's restricted to admin/staff.
router.use(protect, authorize("admin", "staff"));
router.post("/ask", ask);

module.exports = router;
