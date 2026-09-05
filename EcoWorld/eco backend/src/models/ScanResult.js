const mongoose = require("mongoose");

const WASTE_CATEGORIES = [
  "Plastic",
  "Organic",
  "Paper",
  "Glass",
  "Metal",
  "E-Waste",
  "Hazardous Waste",
  "Mixed Waste",
];

const scanResultSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    detectedItem: { type: String, required: true },
    category: { type: String, enum: WASTE_CATEGORIES, required: true },
    confidence: { type: Number, min: 0, max: 100, required: true },
    recyclable: { type: Boolean, required: true },
    disposalRecommendation: { type: String, required: true },
    source: { type: String, enum: ["ai", "mock"], default: "mock" },
  },
  { timestamps: true }
);

scanResultSchema.statics.CATEGORIES = WASTE_CATEGORIES;

module.exports = mongoose.model("ScanResult", scanResultSchema);
