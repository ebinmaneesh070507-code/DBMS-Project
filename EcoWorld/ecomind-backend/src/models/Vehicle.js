const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    vehicleId: { type: String, required: true, unique: true, trim: true }, // e.g. "TRK-01"
    assignedZone: { type: String, required: true },
    capacityKg: { type: Number, required: true },
    currentLoadKg: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Idle", "En Route", "Collecting", "Returning", "Maintenance"],
      default: "Idle",
    },
    route: [{ type: String }], // e.g. ["Depot", "Bin 05", "Bin 01", "Bin 03", "Recycling Facility"]
    optimizationScore: { type: Number, min: 0, max: 100 },
    distanceSavedKm: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
