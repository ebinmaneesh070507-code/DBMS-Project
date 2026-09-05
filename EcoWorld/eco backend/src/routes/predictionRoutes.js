const express = require("express");
const { getPredictions } = require("../controllers/predictionController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", getPredictions);

module.exports = router;
