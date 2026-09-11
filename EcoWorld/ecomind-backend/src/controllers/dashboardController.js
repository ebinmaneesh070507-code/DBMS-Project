const asyncHandler = require("../utils/asyncHandler");
const Incident = require("../models/Incident");
const User = require("../models/User");
const aiService = require("../services/aiService");

// @route GET /api/dashboard/stats
// @desc  City-wide (campus-wide) stat cards. Visible to any signed-in user —
//        aggregate counts only, no personal data, so this is safe to treat
//        as "general analytics" for both citizens and responders.
const getStats = asyncHandler(async (req, res) => {
  const incidents = await Incident.find();

  const open = incidents.filter((i) => i.status !== "Resolved");
  const resolved = incidents.filter((i) => i.status === "Resolved");
  const criticalOpen = open.filter((i) => i.severity === "Critical");
  const dispatchNeeded = incidents.filter((i) => i.dispatchRequired && i.status === "Reported");

  const resolutionTimes = resolved
    .filter((i) => i.respondedAt && i.resolvedAt)
    .map((i) => new Date(i.resolvedAt) - new Date(i.respondedAt));
  const avgResolutionMinutes = resolutionTimes.length
    ? Math.round(resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length / 60000)
    : null;

  const activeResponders = await User.countDocuments({ role: "responder" });

  res.json({
    success: true,
    data: {
      totalIncidents: incidents.length,
      openIncidents: open.length,
      resolvedIncidents: resolved.length,
      criticalOpenIncidents: criticalOpen.length,
      awaitingDispatch: dispatchNeeded.length,
      avgResolutionMinutes,
      activeResponders,
    },
  });
});

// @route GET /api/dashboard/charts
// @desc  Real aggregations from the Incident collection — nothing hardcoded.
//        If there's no data yet, arrays come back empty and the frontend
//        shows an empty state rather than fake numbers.
const getCharts = asyncHandler(async (req, res) => {
  const incidents = await Incident.find();

  const byZoneMap = {};
  const byWasteTypeMap = {};
  const bySeverityMap = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  const byDayMap = {};

  incidents.forEach((i) => {
    byZoneMap[i.zone] = byZoneMap[i.zone] || { zone: i.zone, total: 0, resolved: 0 };
    byZoneMap[i.zone].total += 1;
    if (i.status === "Resolved") byZoneMap[i.zone].resolved += 1;

    (i.wasteTypes || []).forEach((wt) => {
      byWasteTypeMap[wt] = (byWasteTypeMap[wt] || 0) + 1;
    });

    if (bySeverityMap[i.severity] !== undefined) bySeverityMap[i.severity] += 1;

    const day = i.createdAt.toISOString().slice(0, 10);
    byDayMap[day] = (byDayMap[day] || 0) + 1;
  });

  // Last 14 days, including days with zero incidents, in chronological order.
  const dailyTrend = [];
  for (let d = 13; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const key = date.toISOString().slice(0, 10);
    dailyTrend.push({ date: key, count: byDayMap[key] || 0 });
  }

  res.json({
    success: true,
    data: {
      incidentsByZone: Object.values(byZoneMap).sort((a, b) => b.total - a.total),
      incidentsByWasteType: Object.entries(byWasteTypeMap).map(([type, count]) => ({ type, count })),
      incidentsBySeverity: Object.entries(bySeverityMap).map(([severity, count]) => ({ severity, count })),
      dailyTrend,
    },
  });
});

// @route GET /api/dashboard/insights
// @desc  AI-generated (or mock) insight cards grounded in real live data.
const getInsights = asyncHandler(async (req, res) => {
  const incidents = await Incident.find();
  const open = incidents.filter((i) => i.status !== "Resolved");

  const staleOpen = open.filter((i) => Date.now() - new Date(i.createdAt).getTime() > 24 * 60 * 60 * 1000);
  const byZoneCount = {};
  incidents.forEach((i) => {
    byZoneCount[i.zone] = (byZoneCount[i.zone] || 0) + 1;
  });
  const topZone = Object.entries(byZoneCount).sort((a, b) => b[1] - a[1])[0];

  const contextData = {
    totalIncidents: incidents.length,
    openIncidents: open.length,
    criticalOpen: open.filter((i) => i.severity === "Critical").length,
    unresolvedOver24h: staleOpen.length,
    topZoneByIncidentCount: topZone ? { zone: topZone[0], count: topZone[1] } : null,
    activeResponders: await User.countDocuments({ role: "responder" }),
  };

  const insights = await aiService.generateInsights(contextData);
  res.json({ success: true, data: insights });
});

// @route GET /api/dashboard/my-stats
// @desc  A single user's personal contribution summary — shape depends on
//        whether they're a citizen (reports) or a responder (claims).
const getMyStats = asyncHandler(async (req, res) => {
  if (req.user.role === "responder" || req.user.role === "admin") {
    const claimed = await Incident.find({ respondedBy: req.user._id }).sort({ createdAt: -1 });
    const resolved = claimed.filter((i) => i.status === "Resolved");
    return res.json({
      success: true,
      data: {
        mode: "responder",
        totalClaimed: claimed.length,
        totalResolved: resolved.length,
        activeAssignments: claimed.length - resolved.length,
        recentClaimed: claimed.slice(0, 10),
      },
    });
  }

  const reported = await Incident.find({ reportedBy: req.user._id }).sort({ createdAt: -1 });
  const resolved = reported.filter((i) => i.status === "Resolved");
  const byWasteType = {};
  reported.forEach((i) => (i.wasteTypes || []).forEach((wt) => (byWasteType[wt] = (byWasteType[wt] || 0) + 1)));

  res.json({
    success: true,
    data: {
      mode: "citizen",
      totalReported: reported.length,
      totalResolved: resolved.length,
      pending: reported.length - resolved.length,
      contributionsByWasteType: Object.entries(byWasteType).map(([type, count]) => ({ type, count })),
      recentReports: reported.slice(0, 10),
    },
  });
});

module.exports = { getStats, getCharts, getInsights, getMyStats };
