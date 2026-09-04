const express = require("express");
const { getPredictions } = require("../controllers/predictionController");

const router = express.Router();

router.get("/", getPredictions);

module.exports = router;
