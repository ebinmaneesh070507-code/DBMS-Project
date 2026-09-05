/**
 * dispatchService.js
 * -------------------------------------------------------------------------
 * Decides which collection vehicle/team should be sent to a newly filed
 * waste report and updates that vehicle's status + route.
 *
 * Logic (simple and transparent on purpose — swap for a real routing
 * optimizer later without touching callers):
 *   1. Look for a vehicle already assigned to the report's zone that isn't
 *      full and isn't in Maintenance.
 *   2. If none exists, spin up a new vehicle record for that zone so there
 *      is always someone to dispatch (mirrors a real ops desk keeping a
 *      standby unit per zone).
 *   3. Mark the vehicle "En Route", add the report's location as the next
 *      stop on its route, bump its load by the report's estimated weight.
 *   4. Mark the report "Assigned" and link it to the vehicle.
 *
 * High-priority (hazardous / high fill / high priority) reports jump the
 * queue by being added to the front of the route.
 * -------------------------------------------------------------------------
 */

const Vehicle = require("../models/Vehicle");

async function findOrCreateVehicleForZone(zone) {
  let vehicle = await Vehicle.findOne({
    assignedZone: zone,
    status: { $in: ["Idle", "En Route", "Collecting"] },
  }).sort({ currentLoadKg: 1 });

  if (!vehicle) {
    const count = await Vehicle.countDocuments();
    vehicle = await Vehicle.create({
      vehicleId: `TRK-${String(count + 1).padStart(2, "0")}`,
      assignedZone: zone,
      capacityKg: 2000,
      currentLoadKg: 0,
      status: "Idle",
      route: ["Depot"],
      optimizationScore: 75,
      distanceSavedKm: 0,
    });
  }

  return vehicle;
}

/**
 * @param {object} report - a saved WasteReport or DumpingReport document
 * @param {"waste"|"dumping"} kind
 */
async function dispatchTeam(report, kind = "waste") {
  const vehicle = await findOrCreateVehicleForZone(report.zone);

  const stopLabel = kind === "waste" ? `Report ${report._id.toString().slice(-5)}` : `Dumping ${report._id.toString().slice(-5)}`;
  const isUrgent = report.priority === "High";

  const route = Array.isArray(vehicle.route) && vehicle.route.length ? [...vehicle.route] : ["Depot"];
  if (isUrgent) {
    route.splice(1, 0, stopLabel); // jump the queue, right after Depot
  } else {
    route.push(stopLabel);
  }

  vehicle.route = route;
  vehicle.status = vehicle.status === "Maintenance" ? "En Route" : vehicle.status === "Idle" ? "En Route" : vehicle.status;
  if (kind === "waste") {
    vehicle.currentLoadKg = Math.min(vehicle.capacityKg, vehicle.currentLoadKg + (report.estimatedWeightKg || 3));
  }
  vehicle.optimizationScore = Math.min(99, (vehicle.optimizationScore || 75) + (isUrgent ? 3 : 1));

  await vehicle.save();

  report.status = "Assigned";
  report.assignedVehicle = vehicle._id;
  report.dispatchedAt = new Date();
  report.dispatchNote = `Dispatched to vehicle ${vehicle.vehicleId}, currently servicing ${vehicle.assignedZone}.`;

  return { vehicle, report };
}

module.exports = { dispatchTeam, findOrCreateVehicleForZone };
