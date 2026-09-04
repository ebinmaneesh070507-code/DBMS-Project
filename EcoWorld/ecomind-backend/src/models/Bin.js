const mongoose = require("mongoose");

const binSchema = new mongoose.Schema(
  {
    binId: { type: String, required: true, unique: true, trim: true }, // e.g. "BIN-001"
    zone: { type: String, required: true },
    wasteType: {
      type: String,
      enum: ["Plastic", "Organic", "Paper", "Glass", "Metal", "E-Waste", "Hazardous Waste", "Mixed Waste"],
      required: true,
    },
    fillPercentage: { type: Number, min: 0, max: 100, required: true },
    status: {
      type: String,
      enum: ["Normal", "Medium", "High", "Critical"],
      default: "Normal",
    },
    predictedFullInHours: { type: Number }, // AI prediction, e.g. 6
    latitude: Number,
    longitude: Number,
  },
  { timestamps: true }
);

// Auto-derive status from fill percentage if not explicitly set
binSchema.pre("save", function (next) {
  if (this.isModified("fillPercentage")) {
    if (this.fillPercentage >= 90) this.status = "Critical";
    else if (this.fillPercentage >= 70) this.status = "High";
    else if (this.fillPercentage >= 40) this.status = "Medium";
    else this.status = "Normal";
  }
  next();
});

module.exports = mongoose.model("Bin", binSchema);
