const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    service: "EcoMind API",
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;