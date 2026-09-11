const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Bin = require("../models/Bin");

// @route GET /api/bins
const getBins = asyncHandler(async (req, res) => {
  const { zone, status } = req.query;
  const filter = {};
  if (zone) filter.zone = zone;
  if (status) filter.status = status;

  const bins = await Bin.find(filter).sort({ fillPercentage: -1 });
  res.json({ success: true, count: bins.length, data: bins });
});

// @route GET /api/bins/:id
const getBinById = asyncHandler(async (req, res) => {
  const bin = await Bin.findById(req.params.id);
  if (!bin) throw new ApiError(404, "Bin not found");
  res.json({ success: true, data: bin });
});

// @route POST /api/bins
const createBin = asyncHandler(async (req, res) => {
  const bin = await Bin.create(req.body);
  res.status(201).json({ success: true, data: bin });
});

// @route PATCH /api/bins/:id
// @desc  Update fill level / status, e.g. from an IoT sensor feed
const updateBin = asyncHandler(async (req, res) => {
  const bin = await Bin.findById(req.params.id);
  if (!bin) throw new ApiError(404, "Bin not found");

  Object.assign(bin, req.body);
  await bin.save(); // triggers pre-save hook to recompute status
  res.json({ success: true, data: bin });
});

// @route DELETE /api/bins/:id
const deleteBin = asyncHandler(async (req, res) => {
  const bin = await Bin.findByIdAndDelete(req.params.id);
  if (!bin) throw new ApiError(404, "Bin not found");
  res.json({ success: true, message: "Bin deleted" });
});

module.exports = { getBins, getBinById, createBin, updateBin, deleteBin };
