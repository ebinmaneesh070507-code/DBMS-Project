const mongoose = require("mongoose");

const wasteReportSchema = new mongoose.Schema(
  {
    wasteType: {
      type: String,
      enum: ["Plastic", "Organic", "Paper", "Glass", "Metal", "E-Waste", "Hazardous Waste", "Mixed Waste"],
      required: true,
    },
    description: { type: String, required: true, trim: true },
    zone: { type: String, required: true, trim: true },
    imageUrl: { type: String },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    status: {
      type: String,
      enum: ["Pending", "Under Review", "Assigned", "Resolved"],
      default: "Pending",
    },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Where the citizen was standing when they filed the report (captured
    // from the browser's Geolocation API).
    location: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String, trim: true }, // reverse-geocoded, if available
    },

    // What the Gemini vision model (or mock fallback) found in the photo.
    aiAnalysis: {
      detectedItem: { type: String },
      category: { type: String },
      confidence: { type: Number, min: 0, max: 100 },
      recyclable: { type: Boolean },
      hazardous: { type: Boolean, default: false },
      disposalRecommendation: { type: String },
      source: { type: String, enum: ["ai", "mock"], default: "mock" },
    },

    // A rough weight estimate (kg) so dashboards can total real, non-fake
    // "waste collected" figures instead of a hardcoded number. Derived from
    // the AI-detected category unless overridden.
    estimatedWeightKg: { type: Number, default: 3 },

    // Auto-dispatch bookkeeping
    assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
    dispatchedAt: { type: Date },
    dispatchNote: { type: String, trim: true },
  },
  { timestamps: true }
);

wasteReportSchema.index({ reportedBy: 1, createdAt: -1 });
wasteReportSchema.index({ zone: 1, status: 1 });

module.exports = mongoose.model("WasteReport", wasteReportSchema);
