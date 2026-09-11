const asyncHandler = require("../utils/asyncHandler");
const Incident = require("../models/Incident");
const Zone = require("../models/Zone");

// @route GET /api/predictions
// @desc  Real trend analysis per zone: compares incident counts in the last
//        7 days against the 7 days before that, and projects a simple
//        next-7-day estimate from the observed rate of change. This is
//        genuine statistics over real timestamps — not a fabricated number.
//        Zones with too little history to say anything meaningful are
//        marked insufficientData instead of guessing.
const getPredictions = asyncHandler(async (req, res) => {
  const zones = await Zone.find().sort({ name: 1 });
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  const predictions = await Promise.all(
    zones.map(async (z) => {
      const recentWindow = await Incident.find({
        zone: z.name,
        createdAt: { $gte: new Date(now - 7 * DAY) },
      });
      const priorWindow = await Incident.find({
        zone: z.name,
        createdAt: { $gte: new Date(now - 14 * DAY), $lt: new Date(now - 7 * DAY) },
      });

      const currentCount = recentWindow.length;
      const priorCount = priorWindow.length;

      if (currentCount + priorCount < 3) {
        return {
          zone: z.name,
          insufficientData: true,
          currentWeekIncidents: currentCount,
          message: "Not enough incident history yet in this zone for a reliable trend.",
        };
      }

      const changePercent = priorCount === 0 ? 100 : Math.round(((currentCount - priorCount) / priorCount) * 100);
      const projectedNextWeek = Math.max(0, Math.round(currentCount * (1 + changePercent / 100)));

      let recommendation = "Current response coverage looks sufficient for this zone.";
      if (changePercent >= 25) recommendation = `Incident volume is rising sharply in ${z.name} — consider assigning more responders here.`;
      else if (changePercent <= -25) recommendation = `Incident volume is dropping in ${z.name} — coverage here could likely be reduced.`;

      return {
        zone: z.name,
        insufficientData: false,
        currentWeekIncidents: currentCount,
        priorWeekIncidents: priorCount,
        changePercent,
        projectedNextWeekIncidents: projectedNextWeek,
        recommendation,
      };
    })
  );

  res.json({ success: true, count: predictions.length, data: predictions });
});

module.exports = { getPredictions };
