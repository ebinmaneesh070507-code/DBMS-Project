const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const DumpingReport = require("../models/DumpingReport");
const geoService = require("../services/geoService");
const dispatchService = require("../services/dispatchService");

const parseCoord = (v) => (v === undefined || v === null || v === "" ? undefined : Number(v));

// @route POST /api/dumping-reports
const createDumpingReport = asyncHandler(async (req, res) => {
  const { description, priority } = req.body;
  let { zone } = req.body;
  const lat = parseCoord(req.body.lat);
  const lng = parseCoord(req.body.lng);

  if (!description) throw new ApiError(400, "description is required");
  if (!req.file) throw new ApiError(400, "An image is required (field name: image)");

  if (!zone) {
    const geo = await geoService.reverseGeocode(lat, lng);
    zone = geo.zone;
  }

  let report = await DumpingReport.create({
    zone,
    description,
    priority,
    imageUrl: `/uploads/${req.file.filename}`,
    reportedBy: req.user._id,
    location: { lat, lng },
  });

  const { vehicle } = await dispatchService.dispatchTeam(report, "dumping");
  await report.save();

  res.status(201).json({
    success: true,
    data: report,
    dispatch: { vehicleId: vehicle.vehicleId, zone: vehicle.assignedZone, status: vehicle.status },
  });
});

// @route GET /api/dumping-reports  (admin/staff — all incidents)
const getDumpingReports = asyncHandler(async (req, res) => {
  const { zone, status } = req.query;
  const filter = {};
  if (zone) filter.zone = zone;
  if (status) filter.status = status;

  const reports = await DumpingReport.find(filter).populate("reportedBy", "name email").sort({ createdAt: -1 });
  res.json({ success: true, count: reports.length, data: reports });
});

// @route GET /api/dumping-reports/mine
const getMyDumpingReports = asyncHandler(async (req, res) => {
  const reports = await DumpingReport.find({ reportedBy: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: reports.length, data: reports });
});

// @route PATCH /api/dumping-reports/:id/status
const updateDumpingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const report = await DumpingReport.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
  if (!report) throw new ApiError(404, "Report not found");
  res.json({ success: true, data: report });
});

module.exports = { createDumpingReport, getDumpingReports, getMyDumpingReports, updateDumpingStatus };
