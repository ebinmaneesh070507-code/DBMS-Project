const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { getZones, createZone, updateZone, deleteZone } = require("../controllers/zoneController");

const router = express.Router();

router.get("/", protect, getZones); // any signed-in user (needed for the report/incident forms)
router.post("/", protect, authorize("admin"), createZone);
router.patch("/:id", protect, authorize("admin"), updateZone);
router.delete("/:id", protect, authorize("admin"), deleteZone);

module.exports = router;
