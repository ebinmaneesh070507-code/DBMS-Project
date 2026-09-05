const asyncHandler = require("../utils/asyncHandler");
const Bin = require("../models/Bin");
const WasteReport = require("../models/WasteReport");
const DumpingReport = require("../models/DumpingReport");
const ScanResult = require("../models/ScanResult");
const aiService = require("../services/aiService");

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// @route GET /api/dashboard/stats
// @desc  Top-level stat cards. Available to any signed-in user (citizens
//        see the same city-wide analytics as admins here — only the raw,
//        per-report/per-area listing in GET /api/reports is admin-only).
const getStats = asyncHandler(async (req, res) => {
  const [reports, totalBins, highRiskBins, activeDumping] = await Promise.all([
    WasteReport.find(),
    Bin.countDocuments(),
    Bin.countDocuments({ status: { $in: ["High", "Critical"] } }),
    DumpingReport.countDocuments({ status: { $ne: "Resolved" } }),
  ]);

  const totalWasteCollectedKg = reports.reduce((sum, r) => sum + (r.estimatedWeightKg || 0), 0);
  const resolved = reports.filter((r) => r.status === "Resolved");
  const totalWasteRecycledKg = resolved
    .filter((r) => r.aiAnalysis?.recyclable)
    .reduce((sum, r) => sum + (r.estimatedWeightKg || 0), 0);

  const recyclableReports = reports.filter((r) => r.aiAnalysis?.recyclable).length;
  const recyclingRate = reports.length ? Math.round((recyclableReports / reports.length) * 100) : 0;

  const activePickupRequests = reports.filter((r) => ["Pending", "Under Review", "Assigned"].includes(r.status)).length;

  res.json({
    success: true,
    data: {
      totalWasteCollectedKg,
      totalWasteRecycledKg,
      recyclingRate,
      activePickupRequests,
      highRiskBins,
      activeIllegalDumpingReports: activeDumping,
      totalBinsMonitored: totalBins,
      totalReportsFiled: reports.length,
    },
  });
});

// @route GET /api/dashboard/charts
// @desc  Data for waste-by-category, waste-by-zone, monthly trend, recycling %.
//        All computed from real WasteReport documents.
const getCharts = asyncHandler(async (req, res) => {
  const reports = await WasteReport.find();

  const byCategory = {};
  const byZone = {};
  const byMonth = {};

  reports.forEach((r) => {
    const kg = r.estimatedWeightKg || 0;

    byCategory[r.wasteType] = (byCategory[r.wasteType] || 0) + 1;

    if (!byZone[r.zone]) byZone[r.zone] = { kg: 0, recycled: 0 };
    byZone[r.zone].kg += kg;
    if (r.aiAnalysis?.recyclable) byZone[r.zone].recycled += kg;

    const d = new Date(r.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!byMonth[key]) byMonth[key] = { label: MONTH_LABELS[d.getMonth()], sort: d.getFullYear() * 12 + d.getMonth(), kg: 0 };
    byMonth[key].kg += kg;
  });

  const monthlyTrend = Object.values(byMonth)
    .sort((a, b) => a.sort - b.sort)
    .slice(-6)
    .map((m) => ({ month: m.label, kg: Math.round(m.kg) }));

  const recyclableReports = reports.filter((r) => r.aiAnalysis?.recyclable).length;
  const recyclingPercentage = reports.length ? Math.round((recyclableReports / reports.length) * 100) : 0;

  res.json({
    success: true,
    data: {
      wasteByCategory: Object.entries(byCategory).map(([category, count]) => ({ category, count })),
      wasteByZone: Object.entries(byZone).map(([zone, v]) => ({ zone, kg: Math.round(v.kg), recycledKg: Math.round(v.recycled) })),
      monthlyTrend,
      recyclingPercentage,
    },
  });
});

// @route GET /api/dashboard/insights
// @desc  AI-generated (or mock) insight cards, grounded in live data.
const getInsights = asyncHandler(async (req, res) => {
  const [bins, reports] = await Promise.all([Bin.find(), WasteReport.find()]);

  const byCategory = {};
  reports.forEach((r) => {
    byCategory[r.wasteType] = (byCategory[r.wasteType] || 0) + 1;
  });

  const contextData = {
    binsNearCapacity: bins.filter((b) => b.fillPercentage >= 80).length,
    totalBins: bins.length,
    pendingReports: reports.filter((r) => r.status === "Pending").length,
    totalReports: reports.length,
    wasteByCategory: byCategory,
  };

  const insights = await aiService.generateInsights(contextData);
  res.json({ success: true, data: insights });
});

module.exports = { getStats, getCharts, getInsights };
