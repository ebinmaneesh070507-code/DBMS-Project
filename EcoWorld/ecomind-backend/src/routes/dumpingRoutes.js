const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const {
  createDumpingReport,
  getDumpingReports,
  updateDumpingStatus,
} = require("../controllers/dumpingController");

const router = express.Router();

router.post("/", upload.single("image"), createDumpingReport);
router.get("/", getDumpingReports);
router.patch("/:id/status", updateDumpingStatus);

module.exports = router;
