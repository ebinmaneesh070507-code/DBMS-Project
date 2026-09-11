const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Incident = require("../models/Incident");
const aiService = require("../services/aiService");

const PUBLIC_USER_FIELDS = "name email picture role";

// @route POST /api/incidents
// @desc  Report a messy/full area: upload a photo + pick a zone. Gemini
//        analyzes the photo and the AI's output *is* the report — no manual
//        category picking. Returns the full AI report immediately so the
//        reporter sees a real-time result.
const createIncident = asyncHandler(async (req, res) => {
  const { zone, citizenNote } = req.body;
  if (!zone || !zone.trim()) throw new ApiError(400, "zone is required");
  if (!req.file) throw new ApiError(400, "Please upload a photo of the area (field name: image)");

  const imageUrl = `/uploads/${req.file.filename}`;
  const triage = await aiService.classifyIncidentImage(req.file.path);

  const incident = await Incident.create({
    zone: zone.trim(),
    imageUrl,
    reportedBy: req.user._id,
    citizenNote: citizenNote?.trim(),
    wasteTypes: triage.wasteTypes,
    severity: triage.severity,
    dispatchRequired: triage.dispatchRequired,
    recommendedResources: triage.recommendedResources,
    aiReport: triage.aiReport,
    aiConfidence: triage.aiConfidence,
    aiSource: triage.source,
    status: "Reported",
  });

  res.status(201).json({ success: true, data: incident });
});

// @route GET /api/incidents
// @desc  Role-aware incident list.
//        - citizen: only incidents THEY reported ("her contributions")
//        - responder: full list (they need to browse to find calls), with
//          an optional assignedToMe=true filter for their own claimed work
//        - admin: everything, no restriction ("all garbage collected in all areas")
const getIncidents = asyncHandler(async (req, res) => {
  const { zone, status, severity, assignedToMe } = req.query;
  const filter = {};

  if (req.user.role === "citizen") {
    filter.reportedBy = req.user._id;
  } else if (assignedToMe === "true") {
    filter.respondedBy = req.user._id;
  }

  if (zone) filter.zone = zone;
  if (status) filter.status = status;
  if (severity) filter.severity = severity;

  const incidents = await Incident.find(filter)
    .sort({ createdAt: -1 })
    .populate("reportedBy", PUBLIC_USER_FIELDS)
    .populate("respondedBy", PUBLIC_USER_FIELDS)
    .limit(200);

  res.json({ success: true, count: incidents.length, data: incidents });
});

// @route GET /api/incidents/open
// @desc  The live "calls" board for responders/admins: unclaimed incidents,
//        most severe and dispatch-required first.
const getOpenIncidents = asyncHandler(async (req, res) => {
  const incidents = await Incident.find({ status: "Reported" })
    .sort({ dispatchRequired: -1, createdAt: 1 })
    .populate("reportedBy", PUBLIC_USER_FIELDS)
    .limit(100);

  const severityRank = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  incidents.sort((a, b) => (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9));

  res.json({ success: true, count: incidents.length, data: incidents });
});

// @route GET /api/incidents/:id
const getIncidentById = asyncHandler(async (req, res) => {
  const incident = await Incident.findById(req.params.id)
    .populate("reportedBy", PUBLIC_USER_FIELDS)
    .populate("respondedBy", PUBLIC_USER_FIELDS);
  if (!incident) throw new ApiError(404, "Incident not found");

  if (req.user.role === "citizen" && String(incident.reportedBy._id) !== String(req.user._id)) {
    throw new ApiError(403, "You can only view incidents you reported");
  }

  res.json({ success: true, data: incident });
});

// @route POST /api/incidents/:id/respond
// @desc  A responder (or admin, simulating a responder) claims this incident.
//        First to claim gets it — admins can force-reassign.
const respondToIncident = asyncHandler(async (req, res) => {
  const incident = await Incident.findById(req.params.id);
  if (!incident) throw new ApiError(404, "Incident not found");

  const alreadyClaimed = !!incident.respondedBy;
  const claimedBySomeoneElse = alreadyClaimed && String(incident.respondedBy) !== String(req.user._id);

  if (claimedBySomeoneElse && req.user.role !== "admin") {
    throw new ApiError(409, "This incident has already been claimed by another response team");
  }

  incident.respondedBy = req.user._id;
  incident.respondedAt = new Date();
  if (incident.status === "Reported") incident.status = "Dispatched";
  await incident.save();

  const populated = await incident.populate([
    { path: "reportedBy", select: PUBLIC_USER_FIELDS },
    { path: "respondedBy", select: PUBLIC_USER_FIELDS },
  ]);

  res.json({ success: true, data: populated });
});

// @route PATCH /api/incidents/:id/status
// @desc  Move an incident through Dispatched -> In Progress -> Resolved.
//        Only the responder who claimed it, or an admin, can update it.
const updateIncidentStatus = asyncHandler(async (req, res) => {
  const { status, resolutionNote } = req.body;
  if (!["Dispatched", "In Progress", "Resolved"].includes(status)) {
    throw new ApiError(400, "status must be one of: Dispatched, In Progress, Resolved");
  }

  const incident = await Incident.findById(req.params.id);
  if (!incident) throw new ApiError(404, "Incident not found");

  const isAssignedResponder = incident.respondedBy && String(incident.respondedBy) === String(req.user._id);
  if (!isAssignedResponder && req.user.role !== "admin") {
    throw new ApiError(403, "Only the responder assigned to this incident (or an admin) can update its status");
  }

  incident.status = status;
  if (status === "Resolved") {
    incident.resolvedAt = new Date();
    if (resolutionNote) incident.resolutionNote = resolutionNote.trim();
  }
  await incident.save();

  res.json({ success: true, data: incident });
});

module.exports = {
  createIncident,
  getIncidents,
  getOpenIncidents,
  getIncidentById,
  respondToIncident,
  updateIncidentStatus,
};
