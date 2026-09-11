const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
} = require("../controllers/reportController");

const router = express.Router();

router.post("/", upload.single("image"), createReport);
router.get("/", getReports);
router.get("/:id", getReportById);
router.patch("/:id/status", updateReportStatus);

module.exports = router;
