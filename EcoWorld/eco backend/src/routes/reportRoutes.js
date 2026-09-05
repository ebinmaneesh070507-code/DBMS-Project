const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createReport,
  getReports,
  getMyReports,
  getMyImpact,
  getReportById,
  updateReportStatus,
} = require("../controllers/reportController");

const router = express.Router();

// Every report route requires a signed-in user.
router.use(protect);

router.post("/", upload.single("image"), createReport);

router.get("/mine", getMyReports); // citizen: their own reports
router.get("/my-impact", getMyImpact); // citizen: their own contribution stats

router.get("/", authorize("admin", "staff"), getReports); // admin/staff: every report, all zones
router.patch("/:id/status", authorize("admin", "staff"), updateReportStatus);

router.get("/:id", getReportById); // controller enforces ownership for citizens

module.exports = router;
