const mongoose = require("mongoose");

// A campus zone/block (e.g. "Psychology Block", "Hostel Block"). Purely a
// reference list — all activity data (incidents, predictions, analytics)
// is computed live from the Incident collection, never stored on the zone.
const zoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Zone", zoneSchema);
