const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true }, // e.g. "Zone A"
    weeklyWasteKg: { type: Number, default: 0 },
    predictedNextWeekKg: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Zone", zoneSchema);
