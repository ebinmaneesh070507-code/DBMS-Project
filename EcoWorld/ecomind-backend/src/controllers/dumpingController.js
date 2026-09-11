const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const DumpingReport = require("../models/DumpingReport");

// @route POST /api/dumping-reports
const createDumpingReport = asyncHandler(async (req, res) => {
  const { zone, description, priority } = req.body;
  if (!zone || !description) throw new ApiError(400, "zone and description are required");
  if (!req.file) throw new ApiError(400, "An image is required (field name: image)");

  const report = await DumpingReport.create({
    zone,
    description,
    priority,
    imageUrl: `/uploads/${req.file.filename}`,
    reportedBy: req.user ? req.user._id : undefined,
  });

  res.status(201).json({ success: true, data: report });
});

// @route GET /api/dumping-reports
const getDumpingReports = asyncHandler(async (req, res) => {
  const { zone, status } = req.query;
  const filter = {};
  if (zone) filter.zone = zone;
  if (status) filter.status = status;

  const reports = await DumpingReport.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: reports.length, data: reports });
});

// @route PATCH /api/dumping-reports/:id/status
const updateDumpingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const report = await DumpingReport.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
  if (!report) throw new ApiError(404, "Report not found");
  res.json({ success: true, data: report });
});

module.exports = { createDumpingReport, getDumpingReports, updateDumpingStatus };
