const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Vehicle = require("../models/Vehicle");

// @route GET /api/collection/vehicles
const getVehicles = asyncHandler(async (req, res) => {
  const { zone, status } = req.query;
  const filter = {};
  if (zone) filter.assignedZone = zone;
  if (status) filter.status = status;

  const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: vehicles.length, data: vehicles });
});

// @route GET /api/collection/vehicles/:id
const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) throw new ApiError(404, "Vehicle not found");
  res.json({ success: true, data: vehicle });
});

// @route POST /api/collection/vehicles
const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.create(req.body);
  res.status(201).json({ success: true, data: vehicle });
});

// @route PATCH /api/collection/vehicles/:id
const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!vehicle) throw new ApiError(404, "Vehicle not found");
  res.json({ success: true, data: vehicle });
});

// @route DELETE /api/collection/vehicles/:id
const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
  if (!vehicle) throw new ApiError(404, "Vehicle not found");
  res.json({ success: true, message: "Vehicle deleted" });
});

module.exports = { getVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle };
