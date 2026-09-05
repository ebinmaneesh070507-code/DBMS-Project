const mongoose = require("mongoose");

const dumpingReportSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    zone: { type: String, required: true },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Pending", "Under Review", "Assigned", "Resolved"],
      default: "Pending",
    },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    location: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

dumpingReportSchema.index({ reportedBy: 1, createdAt: -1 });

module.exports = mongoose.model("DumpingReport", dumpingReportSchema);
