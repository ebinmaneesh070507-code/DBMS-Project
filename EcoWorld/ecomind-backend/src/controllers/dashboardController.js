const asyncHandler = require("../utils/asyncHandler");
const Bin = require("../models/Bin");
const WasteReport = require("../models/WasteReport");
const DumpingReport = require("../models/DumpingReport");
const ScanResult = require("../models/ScanResult");
const aiService = require("../services/aiService");

// @route GET /api/dashboard/stats
// @desc  Top-level stat cards for the admin dashboard
const getStats = asyncHandler(async (req, res) => {
  const [totalBins, highRiskBins, activeReports, activeDumping, scans] = await Promise.all([
    Bin.countDocuments(),
    Bin.countDocuments({ status: { $in: ["High", "Critical"] } }),
    WasteReport.countDocuments({ status: { $in: ["Pending", "Under Review", "Assigned"] } }),
    DumpingReport.countDocuments({ status: { $ne: "Resolved" } }),
    ScanResult.find(),
  ]);

  const recyclableScans = scans.filter((s) => s.recyclable).length;
  const recyclingRate = scans.length ? Math.round((recyclableScans / scans.length) * 100) : 0;

  // Mocked aggregate totals; swap for real sensor/collection-log aggregation later.
  const totalWasteCollectedKg = 48250;
  const totalWasteRecycledKg = Math.round(totalWasteCollectedKg * (recyclingRate || 62) / 100);

  res.json({
    success: true,
    data: {
      totalWasteCollectedKg,
      totalWasteRecycledKg,
      recyclingRate: recyclingRate || 62,
      activePickupRequests: activeReports,
      highRiskBins,
      activeIllegalDumpingReports: activeDumping,
      totalBinsMonitored: totalBins,
    },
  });
});

// @route GET /api/dashboard/charts
// @desc  Data for waste-by-category, waste-by-zone, monthly trend, recycling % charts
const getCharts = asyncHandler(async (req, res) => {
  const scans = await ScanResult.find();

  const byCategory = {};
  scans.forEach((s) => {
    byCategory[s.category] = (byCategory[s.category] || 0) + 1;
  });

  // Mock data for charts not yet backed by real aggregations
  const wasteByZone = [
    { zone: "Zone A", kg: 1240 },
    { zone: "Zone B", kg: 980 },
    { zone: "Zone C", kg: 1560 },
    { zone: "Zone D", kg: 760 },
  ];

  const monthlyTrend = [
    { month: "Apr", kg: 15200 },
    { month: "May", kg: 16800 },
    { month: "Jun", kg: 17650 },
    { month: "Jul", kg: 18100 },
    { month: "Aug", kg: 19400 },
  ];

  res.json({
    success: true,
    data: {
      wasteByCategory: Object.keys(byCategory).length
        ? Object.entries(byCategory).map(([category, count]) => ({ category, count }))
        : [
            { category: "Plastic", count: 42 },
            { category: "Organic", count: 65 },
            { category: "Paper", count: 30 },
            { category: "Glass", count: 18 },
            { category: "Metal", count: 12 },
            { category: "E-Waste", count: 7 },
          ],
      wasteByZone,
      monthlyTrend,
      recyclingPercentage: 62,
    },
  });
});

// @route GET /api/dashboard/insights
// @desc  AI-generated (or mock) insight cards
const getInsights = asyncHandler(async (req, res) => {
  const [bins, reports] = await Promise.all([Bin.find(), WasteReport.find()]);

  const contextData = {
    binsNearCapacity: bins.filter((b) => b.fillPercentage >= 80).length,
    totalBins: bins.length,
    pendingReports: reports.filter((r) => r.status === "Pending").length,
  };

  const insights = await aiService.generateInsights(contextData);
  res.json({ success: true, data: insights });
});

module.exports = { getStats, getCharts, getInsights };
