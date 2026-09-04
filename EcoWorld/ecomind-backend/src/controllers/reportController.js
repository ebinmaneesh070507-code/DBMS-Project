const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const WasteReport = require("../models/WasteReport");

// @route POST /api/reports
const createReport = asyncHandler(async (req, res) => {
  const { wasteType, description, zone, priority } = req.body;
  if (!wasteType || !description || !zone) {
    throw new ApiError(400, "wasteType, description and zone are required");
  }

  const report = await WasteReport.create({
    wasteType,
    description,
    zone,
    priority,
    imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
    reportedBy: req.user ? req.user._id : undefined,
  });

  res.status(201).json({ success: true, message: "Report submitted successfully", data: report });
});

// @route GET /api/reports
const getReports = asyncHandler(async (req, res) => {
  const { zone, status, priority } = req.query;
  const filter = {};
  if (zone) filter.zone = zone;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const reports = await WasteReport.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: reports.length, data: reports });
});

// @route GET /api/reports/:id
const getReportById = asyncHandler(async (req, res) => {
  const report = await WasteReport.findById(req.params.id);
  if (!report) throw new ApiError(404, "Report not found");
  res.json({ success: true, data: report });
});

// @route PATCH /api/reports/:id/status
const updateReportStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const report = await WasteReport.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
  if (!report) throw new ApiError(404, "Report not found");
  res.json({ success: true, data: report });
});

module.exports = { createReport, getReports, getReportById, updateReportStatus };
