const mongoose = require("mongoose");

// ---------------------------------------------------------------------------
// Incident
// ---------------------------------------------------------------------------
// A citizen photographs a messy/full area and picks a campus zone. The photo
// is sent to Gemini, which decides what's actually in the image — waste
// types, how severe it is, whether a response team needs to be dispatched,
// and what they should bring. That AI output IS the report (no manual
// category picking by the citizen). A responder ("team") then claims the
// incident, works it, and resolves it. Everything here is real data written
// by real actions — nothing on this model is ever hardcoded or simulated at
// the schema level.
// ---------------------------------------------------------------------------

const incidentSchema = new mongoose.Schema(
  {
    zone: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Optional context the reporter can add alongside the photo.
    citizenNote: { type: String, trim: true, maxlength: 500 },

    // --- AI triage output (from Gemini vision, or mock fallback) ---
    wasteTypes: [
      {
        type: String,
        enum: ["Plastic", "Organic", "Paper", "Glass", "Metal", "E-Waste", "Hazardous Waste", "Mixed Waste"],
      },
    ],
    severity: { type: String, enum: ["Low", "Medium", "High", "Critical"], required: true },
    dispatchRequired: { type: Boolean, required: true },
    recommendedResources: [{ type: String }],
    aiReport: { type: String, required: true }, // human-readable AI-written summary shown to the reporter in real time
    aiConfidence: { type: Number, min: 0, max: 100 },
    aiSource: { type: String, enum: ["ai", "mock"], default: "mock" },

    // --- Responder / dispatch workflow ---
    status: {
      type: String,
      enum: ["Reported", "Dispatched", "In Progress", "Resolved"],
      default: "Reported",
    },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    respondedAt: { type: Date },
    resolvedAt: { type: Date },
    resolutionNote: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

incidentSchema.statics.WASTE_TYPES = [
  "Plastic",
  "Organic",
  "Paper",
  "Glass",
  "Metal",
  "E-Waste",
  "Hazardous Waste",
  "Mixed Waste",
];

incidentSchema.statics.SEVERITIES = ["Low", "Medium", "High", "Critical"];

module.exports = mongoose.model("Incident", incidentSchema);
