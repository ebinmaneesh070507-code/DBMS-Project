const express = require("express");
const router = express.Router();

// Temporary in-memory data.
// Replace this with MySQL/PostgreSQL later.
let wasteRecords = [
  {
    id: 1,
    item: "Plastic bottle",
    category: "Plastic",
    quantityKg: 0.05,
    zone: "Zone A",
    source: "AI Scanner",
    confidence: 0.96,
    createdAt: new Date().toISOString()
  }
];

// GET /api/waste
router.get("/", (req, res) => {
  res.json({
    success: true,
    count: wasteRecords.length,
    data: wasteRecords
  });
});

// GET /api/waste/:id
router.get("/:id", (req, res) => {
  const record = wasteRecords.find(
    (item) => item.id === Number(req.params.id)
  );

  if (!record) {
    return res.status(404).json({
      success: false,
      message: "Waste record not found"
    });
  }

  res.json({
    success: true,
    data: record
  });
});

// POST /api/waste
router.post("/", (req, res) => {
  const {
    item,
    category,
    quantityKg,
    zone,
    source = "Manual",
    confidence = null
  } = req.body;

  if (!item || !category || quantityKg === undefined || !zone) {
    return res.status(400).json({
      success: false,
      message: "item, category, quantityKg and zone are required"
    });
  }

  const newRecord = {
    id: wasteRecords.length
      ? Math.max(...wasteRecords.map((item) => item.id)) + 1
      : 1,
    item,
    category,
    quantityKg: Number(quantityKg),
    zone,
    source,
    confidence: confidence === null ? null : Number(confidence),
    createdAt: new Date().toISOString()
  };

  wasteRecords.push(newRecord);

  res.status(201).json({
    success: true,
    message: "Waste record created",
    data: newRecord
  });
});

// DELETE /api/waste/:id
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = wasteRecords.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Waste record not found"
    });
  }

  const deleted = wasteRecords.splice(index, 1)[0];

  res.json({
    success: true,
    message: "Waste record deleted",
    data: deleted
  });
});

module.exports = router;