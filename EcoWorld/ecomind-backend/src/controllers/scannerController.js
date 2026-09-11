const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ScanResult = require("../models/ScanResult");
const aiService = require("../services/aiService");

// @route POST /api/scanner/analyze
// @desc  Upload a waste image, classify it via AI (or mock), store + return the result
const analyzeWaste = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Please upload an image file (field name: image)");

  const imageUrl = `/uploads/${req.file.filename}`;
  const classification = await aiService.classifyWasteImage(req.file.path);

  const scan = await ScanResult.create({
    imageUrl,
    detectedItem: classification.detectedItem,
    category: classification.category,
    confidence: classification.confidence,
    recyclable: classification.recyclable,
    disposalRecommendation: classification.disposalRecommendation,
    source: classification.source,
    scannedBy: req.user._id,
  });

  res.status(201).json({ success: true, data: scan });
});

// @route GET /api/scanner/history
// @desc  Admins see every scan; citizens/viewers only see their own.
const getScanHistory = asyncHandler(async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { scannedBy: req.user._id };
  const scans = await ScanResult.find(filter).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, count: scans.length, data: scans });
});

// @route GET /api/scanner/categories
const getCategories = asyncHandler(async (req, res) => {
  res.json({ success: true, data: ScanResult.CATEGORIES });
});

module.exports = { analyzeWaste, getScanHistory, getCategories };
