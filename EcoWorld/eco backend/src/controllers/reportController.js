const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const WasteReport = require("../models/WasteReport");
const aiService = require("../services/aiService");
const geoService = require("../services/geoService");
const dispatchService = require("../services/dispatchService");

// Rough average weight (kg) per category, used to give dashboards a real
// (if approximate) "total waste collected" figure instead of a fake constant.
const CATEGORY_WEIGHT_KG = {
  Plastic: 2,
  Organic: 4,
  Paper: 3,
  Glass: 5,
  Metal: 6,
  "E-Waste": 8,
  "Hazardous Waste": 5,
  "Mixed Waste": 4,
};

const parseCoord = (v) => (v === undefined || v === null || v === "" ? undefined : Number(v));

// @route POST /api/reports
// @desc  The core citizen flow: upload a photo + your GPS location of a
//        waste/garbage issue. The photo is analyzed by the AI model
//        (Gemini, or a mock fallback), the location is reverse-geocoded
//        into a zone, and a collection team is auto-dispatched.
const createReport = asyncHandler(async (req, res) => {
  const { description, zone: zoneOverride, priority: priorityOverride, wasteType: wasteTypeOverride } = req.body;
  const lat = parseCoord(req.body.lat);
  const lng = parseCoord(req.body.lng);

  if (!req.file) throw new ApiError(400, "Please attach a photo of the waste (field name: image)");
  if (!description) throw new ApiError(400, "description is required");

  // 1. AI classification of the photo
  const classification = await aiService.classifyWasteImage(req.file.path);

  // 2. Location -> zone (reverse geocoded via Google Maps if configured)
  let zone = zoneOverride;
  let address;
  if (!zone) {
    const geo = await geoService.reverseGeocode(lat, lng);
    zone = geo.zone;
    address = geo.address;
  }

  const wasteType = wasteTypeOverride || classification.category || "Mixed Waste";
  const hazardous = wasteType === "Hazardous Waste" || wasteType === "E-Waste";

  // 3. Priority: respect an explicit override, otherwise derive from the AI read
  const priority = priorityOverride || (hazardous ? "High" : classification.confidence >= 90 ? "Medium" : "Medium");

  const estimatedWeightKg = CATEGORY_WEIGHT_KG[wasteType] || 3;

  let report = await WasteReport.create({
    wasteType,
    description,
    zone,
    priority,
    imageUrl: `/uploads/${req.file.filename}`,
    reportedBy: req.user._id,
    location: { lat, lng, address },
    aiAnalysis: {
      detectedItem: classification.detectedItem,
      category: classification.category,
      confidence: classification.confidence,
      recyclable: classification.recyclable,
      hazardous,
      disposalRecommendation: classification.disposalRecommendation,
      source: classification.source,
    },
    estimatedWeightKg,
  });

  // 4. Auto-dispatch a collection team to the resolved zone
  const { vehicle } = await dispatchService.dispatchTeam(report, "waste");
  await report.save();

  res.status(201).json({
    success: true,
    message: "Report submitted, analyzed by AI, and a collection team has been dispatched.",
    data: report,
    dispatch: {
      vehicleId: vehicle.vehicleId,
      zone: vehicle.assignedZone,
      status: vehicle.status,
      route: vehicle.route,
    },
  });
});

// @route GET /api/reports
// @desc  Admin/staff: every report, with optional filters.
//        Citizens are never routed here — use /api/reports/mine.
const getReports = asyncHandler(async (req, res) => {
  const { zone, status, priority, wasteType } = req.query;
  const filter = {};
  if (zone) filter.zone = zone;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (wasteType) filter.wasteType = wasteType;

  const reports = await WasteReport.find(filter)
    .populate("reportedBy", "name email")
    .populate("assignedVehicle", "vehicleId status assignedZone")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: reports.length, data: reports });
});

// @route GET /api/reports/mine
// @desc  The signed-in citizen's own reports only.
const getMyReports = asyncHandler(async (req, res) => {
  const reports = await WasteReport.find({ reportedBy: req.user._id })
    .populate("assignedVehicle", "vehicleId status assignedZone")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: reports.length, data: reports });
});

// @route GET /api/reports/my-impact
// @desc  Summary stats about the signed-in citizen's own contributions:
//        how much they've reported, in which categories, and how much of
//        it has been resolved.
const getMyImpact = asyncHandler(async (req, res) => {
  const reports = await WasteReport.find({ reportedBy: req.user._id });

  const totalReports = reports.length;
  const totalWeightKg = reports.reduce((sum, r) => sum + (r.estimatedWeightKg || 0), 0);
  const resolvedCount = reports.filter((r) => r.status === "Resolved").length;
  const recyclableCount = reports.filter((r) => r.aiAnalysis?.recyclable).length;

  const byCategory = {};
  reports.forEach((r) => {
    byCategory[r.wasteType] = (byCategory[r.wasteType] || 0) + 1;
  });

  res.json({
    success: true,
    data: {
      totalReports,
      totalWeightKg,
      resolvedCount,
      pendingCount: totalReports - resolvedCount,
      recyclableCount,
      byCategory: Object.entries(byCategory).map(([category, count]) => ({ category, count })),
      memberSince: req.user.createdAt,
    },
  });
});

// @route GET /api/reports/:id
const getReportById = asyncHandler(async (req, res) => {
  const report = await WasteReport.findById(req.params.id)
    .populate("reportedBy", "name email")
    .populate("assignedVehicle", "vehicleId status assignedZone route");
  if (!report) throw new ApiError(404, "Report not found");

  // Citizens may only view their own report by id.
  if (req.user.role === "citizen" && String(report.reportedBy?._id) !== String(req.user._id)) {
    throw new ApiError(403, "You do not have permission to view this report");
  }

  res.json({ success: true, data: report });
});

// @route PATCH /api/reports/:id/status
// @desc  Admin/staff only (enforced by the route middleware).
const updateReportStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const report = await WasteReport.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
  if (!report) throw new ApiError(404, "Report not found");
  res.json({ success: true, data: report });
});

module.exports = { createReport, getReports, getMyReports, getMyImpact, getReportById, updateReportStatus };
