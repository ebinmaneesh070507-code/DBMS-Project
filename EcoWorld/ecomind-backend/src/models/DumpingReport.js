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
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DumpingReport", dumpingReportSchema);
