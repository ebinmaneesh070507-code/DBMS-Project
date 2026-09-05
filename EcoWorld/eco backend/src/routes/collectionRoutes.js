const express = require("express");
const {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/collectionController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// Fleet/route detail is operational data — any signed-in user can view it
// (it's useful context for a viewer's "all analytics"), but only
// admin/staff can manage vehicles.
router.get("/vehicles", getVehicles);
router.get("/vehicles/:id", getVehicleById);
router.post("/vehicles", authorize("admin", "staff"), createVehicle);
router.patch("/vehicles/:id", authorize("admin", "staff"), updateVehicle);
router.delete("/vehicles/:id", authorize("admin", "staff"), deleteVehicle);

module.exports = router;
