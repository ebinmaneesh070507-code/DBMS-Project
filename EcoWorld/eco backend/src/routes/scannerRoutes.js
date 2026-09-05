const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { analyzeWaste, getScanHistory, getCategories } = require("../controllers/scannerController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/categories", getCategories); // static list, no auth needed

router.use(protect);
router.post("/analyze", upload.single("image"), analyzeWaste);
router.get("/history", getScanHistory);

module.exports = router;
