const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createIncident,
  getIncidents,
  getOpenIncidents,
  getIncidentById,
  respondToIncident,
  updateIncidentStatus,
} = require("../controllers/incidentController");

const router = express.Router();

router.use(protect); // every incident route requires sign-in

router.post("/", upload.single("image"), createIncident);
router.get("/", getIncidents);
router.get("/open", authorize("admin", "responder"), getOpenIncidents);
router.get("/:id", getIncidentById);
router.post("/:id/respond", authorize("admin", "responder"), respondToIncident);
router.patch("/:id/status", authorize("admin", "responder"), updateIncidentStatus);

module.exports = router;
