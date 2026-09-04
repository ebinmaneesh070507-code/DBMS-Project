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
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WasteReport", wasteReportSchema);
