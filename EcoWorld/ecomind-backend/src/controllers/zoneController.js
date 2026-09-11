const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Zone = require("../models/Zone");

// @route GET /api/zones
// @desc  Full zone list (for dropdowns/filters). Real DB data only — if
//        nothing is seeded yet this correctly returns an empty array rather
//        than a hardcoded fallback, so the UI shows an empty state instead
//        of lying about what zones exist.
const getZones = asyncHandler(async (req, res) => {
  const zones = await Zone.find().sort({ name: 1 });
  res.json({ success: true, count: zones.length, data: zones });
});

// @route POST /api/zones (admin only)
const createZone = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) throw new ApiError(400, "name is required");

  const exists = await Zone.findOne({ name: name.trim() });
  if (exists) throw new ApiError(409, "A zone with this name already exists");

  const zone = await Zone.create({ name: name.trim() });
  res.status(201).json({ success: true, data: zone });
});

// @route PATCH /api/zones/:id (admin only) - rename a zone
const updateZone = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) throw new ApiError(400, "name is required");

  const zone = await Zone.findByIdAndUpdate(req.params.id, { name: name.trim() }, { new: true, runValidators: true });
  if (!zone) throw new ApiError(404, "Zone not found");
  res.json({ success: true, data: zone });
});

// @route DELETE /api/zones/:id (admin only)
const deleteZone = asyncHandler(async (req, res) => {
  const zone = await Zone.findByIdAndDelete(req.params.id);
  if (!zone) throw new ApiError(404, "Zone not found");
  res.json({ success: true, message: "Zone deleted" });
});

module.exports = { getZones, createZone, updateZone, deleteZone };
