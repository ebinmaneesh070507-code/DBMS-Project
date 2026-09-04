const express = require("express");
const {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/collectionController");

const router = express.Router();

router.get("/vehicles", getVehicles);
router.get("/vehicles/:id", getVehicleById);
router.post("/vehicles", createVehicle);
router.patch("/vehicles/:id", updateVehicle);
router.delete("/vehicles/:id", deleteVehicle);

module.exports = router;
