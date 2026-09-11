const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const Incident = require("../models/Incident");

// @route GET /api/teams
// @desc  Admin-only: every responder account plus their real claim/resolve
//        stats, computed live from the Incident collection. Nothing here is
//        simulated — a responder with zero claimed incidents just shows zeros.
const getTeams = asyncHandler(async (req, res) => {
  const responders = await User.find({ role: "responder" }).select("name email picture createdAt");

  const teams = await Promise.all(
    responders.map(async (r) => {
      const claimed = await Incident.find({ respondedBy: r._id });
      const resolved = claimed.filter((i) => i.status === "Resolved");
      const active = claimed.filter((i) => i.status !== "Resolved");

      const avgResponseMs =
        claimed.length > 0
          ? claimed.reduce((sum, i) => sum + (new Date(i.respondedAt) - new Date(i.createdAt)), 0) / claimed.length
          : null;
      const avgResolveMs =
        resolved.length > 0
          ? resolved.reduce((sum, i) => sum + (new Date(i.resolvedAt) - new Date(i.respondedAt)), 0) / resolved.length
          : null;

      return {
        id: r._id,
        name: r.name,
        email: r.email,
        picture: r.picture,
        memberSince: r.createdAt,
        totalClaimed: claimed.length,
        totalResolved: resolved.length,
        activeAssignments: active.length,
        avgResponseMinutes: avgResponseMs !== null ? Math.round(avgResponseMs / 60000) : null,
        avgResolutionMinutes: avgResolveMs !== null ? Math.round(avgResolveMs / 60000) : null,
      };
    })
  );

  // Most active responders first
  teams.sort((a, b) => b.totalResolved - a.totalResolved);

  res.json({ success: true, count: teams.length, data: teams });
});

module.exports = { getTeams };
