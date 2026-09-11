const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");
const { analyzeWaste, getScanHistory, getCategories } = require("../controllers/scannerController");

const router = express.Router();

router.get("/categories", getCategories); // static reference list, no auth needed
router.post("/analyze", protect, upload.single("image"), analyzeWaste);
router.get("/history", protect, getScanHistory);

module.exports = router;
