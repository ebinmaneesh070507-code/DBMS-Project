/**
 * Seeds the database with *infrastructure* data — bins, vehicles, zones —
 * i.e. things a city would configure once, not user-generated content.
 * It deliberately does NOT create fake WasteReports, DumpingReports, or
 * Users: those should come from real signups and real citizen reports so
 * dashboards reflect actual activity instead of fabricated numbers.
 *
 * Run with: npm run seed
 * To grant yourself admin access afterwards, run: npm run make-admin -- you@example.com
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const Bin = require("../models/Bin");
const Vehicle = require("../models/Vehicle");
const Zone = require("../models/Zone");
const WasteReport = require("../models/WasteReport");
const DumpingReport = require("../models/DumpingReport");

const bins = [
  { binId: "BIN-001", zone: "Zone A", wasteType: "Plastic", fillPercentage: 92, predictedFullInHours: 6 },
  { binId: "BIN-002", zone: "Zone B", wasteType: "Organic", fillPercentage: 55, predictedFullInHours: 30 },
  { binId: "BIN-003", zone: "Zone C", wasteType: "Paper", fillPercentage: 78, predictedFullInHours: 12 },
  { binId: "BIN-004", zone: "Zone A", wasteType: "Glass", fillPercentage: 25, predictedFullInHours: 96 },
  { binId: "BIN-005", zone: "Zone D", wasteType: "Metal", fillPercentage: 88, predictedFullInHours: 8 },
];

const vehicles = [
  {
    vehicleId: "TRK-01",
    assignedZone: "Zone A",
    capacityKg: 2000,
    currentLoadKg: 1200,
    status: "En Route",
    route: ["Depot", "Bin 05", "Bin 01", "Bin 03", "Recycling Facility"],
    optimizationScore: 87,
    distanceSavedKm: 4.2,
  },
  {
    vehicleId: "TRK-02",
    assignedZone: "Zone C",
    capacityKg: 1800,
    currentLoadKg: 400,
    status: "Idle",
    route: [],
    optimizationScore: 0,
    distanceSavedKm: 0,
  },
];

const zones = [
  { name: "Zone A", weeklyWasteKg: 1240, predictedNextWeekKg: 1480 },
  { name: "Zone B", weeklyWasteKg: 980, predictedNextWeekKg: 1010 },
  { name: "Zone C", weeklyWasteKg: 1560, predictedNextWeekKg: 1720 },
  { name: "Zone D", weeklyWasteKg: 760, predictedNextWeekKg: 700 },
];

const run = async () => {
  await connectDB();

  await Promise.all([
    Bin.deleteMany({}),
    Vehicle.deleteMany({}),
    Zone.deleteMany({}),
    WasteReport.deleteMany({}),
    DumpingReport.deleteMany({}),
  ]);

  await Bin.insertMany(bins);
  await Vehicle.insertMany(vehicles);
  await Zone.insertMany(zones);

  console.log("[Seed] Database seeded with mock bins, vehicles and zones.");
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
