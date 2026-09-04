const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Bin = require("../models/Bin");
const WasteReport = require("../models/WasteReport");
const ScanResult = require("../models/ScanResult");
const aiService = require("../services/aiService");

// @route POST /api/assistant/ask
// @desc  Natural-language question over live app data, e.g.
//        "Which zone generated the most plastic waste?"
const ask = asyncHandler(async (req, res) => {
  const { question } = req.body;
  if (!question || !question.trim()) throw new ApiError(400, "question is required");

  // Pull a lightweight snapshot of live data to ground the AI's answer.
  const [bins, reports, scans] = await Promise.all([
    Bin.find().limit(100),
    WasteReport.find().limit(100),
    ScanResult.find().limit(100),
  ]);

  const contextData = {
    bins: bins.map((b) => ({ binId: b.binId, zone: b.zone, wasteType: b.wasteType, fillPercentage: b.fillPercentage, status: b.status })),
    reports: reports.map((r) => ({ wasteType: r.wasteType, zone: r.zone, status: r.status, priority: r.priority })),
    recentScans: scans.map((s) => ({ category: s.category, recyclable: s.recyclable })),
  };

  const result = await aiService.askAssistant(question, contextData);
  res.json({ success: true, question, ...result });
});

module.exports = { ask };
