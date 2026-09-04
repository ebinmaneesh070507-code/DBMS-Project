const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { analyzeWaste, getScanHistory, getCategories } = require("../controllers/scannerController");

const router = express.Router();

router.post("/analyze", upload.single("image"), analyzeWaste);
router.get("/history", getScanHistory);
router.get("/categories", getCategories);

module.exports = router;
