const asyncHandler = require("../utils/asyncHandler");
const Zone = require("../models/Zone");

// @route GET /api/predictions
// @desc  Return current vs predicted waste per zone (from Zone collection),
//        with a simple AI-style recommendation.
const getPredictions = asyncHandler(async (req, res) => {
  let zones = await Zone.find();

  // If no zones are seeded yet, fabricate a realistic mock set so the
  // frontend has something to render out of the box.
  if (zones.length === 0) {
    zones = [
      { name: "Zone A", weeklyWasteKg: 1240, predictedNextWeekKg: 1480 },
      { name: "Zone B", weeklyWasteKg: 980, predictedNextWeekKg: 1010 },
      { name: "Zone C", weeklyWasteKg: 1560, predictedNextWeekKg: 1720 },
      { name: "Zone D", weeklyWasteKg: 760, predictedNextWeekKg: 700 },
    ];
  }

  const predictions = zones.map((z) => {
    const current = z.weeklyWasteKg;
    const predicted = z.predictedNextWeekKg;
    const changePct = current ? Math.round(((predicted - current) / current) * 100) : 0;

    let recommendation = "Maintain current collection schedule.";
    if (changePct >= 15) recommendation = `Increase collection frequency in ${z.name}.`;
    else if (changePct <= -10) recommendation = `Consider reducing collection frequency in ${z.name}.`;

    return {
      zone: z.name,
      currentWeeklyWasteKg: current,
      predictedNextWeekKg: predicted,
      expectedChangePercent: changePct,
      aiRecommendation: recommendation,
    };
  });

  res.json({ success: true, count: predictions.length, data: predictions });
});

module.exports = { getPredictions };
