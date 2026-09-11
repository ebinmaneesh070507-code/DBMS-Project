const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Incident = require("../models/Incident");
const User = require("../models/User");
const aiService = require("../services/aiService");

// @route POST /api/assistant/ask
// @desc  Natural-language question over live campus incident data, e.g.
//        "Which zone has the most unresolved incidents?"
const ask = asyncHandler(async (req, res) => {
  const { question } = req.body;
  if (!question || !question.trim()) throw new ApiError(400, "question is required");

  const [incidents, responderCount] = await Promise.all([
    Incident.find().sort({ createdAt: -1 }).limit(150),
    User.countDocuments({ role: "responder" }),
  ]);

  const contextData = {
    activeResponders: responderCount,
    incidents: incidents.map((i) => ({
      zone: i.zone,
      wasteTypes: i.wasteTypes,
      severity: i.severity,
      status: i.status,
      dispatchRequired: i.dispatchRequired,
      createdAt: i.createdAt,
      resolvedAt: i.resolvedAt,
    })),
  };

  const result = await aiService.askAssistant(question, contextData);
  res.json({ success: true, data: { question, ...result } });
});

module.exports = { ask };
