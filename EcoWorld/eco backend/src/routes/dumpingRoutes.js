const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createDumpingReport,
  getDumpingReports,
  getMyDumpingReports,
  updateDumpingStatus,
} = require("../controllers/dumpingController");

const router = express.Router();

router.use(protect);

router.post("/", upload.single("image"), createDumpingReport);
router.get("/mine", getMyDumpingReports);
router.get("/", authorize("admin", "staff"), getDumpingReports);
router.patch("/:id/status", authorize("admin", "staff"), updateDumpingStatus);

module.exports = router;
