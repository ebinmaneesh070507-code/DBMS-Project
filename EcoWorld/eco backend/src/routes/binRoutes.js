const express = require("express");
const { getBins, getBinById, createBin, updateBin, deleteBin } = require("../controllers/binController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// Any signed-in user (citizen or admin) can view bin status — it's part of
// the "all analytics" a viewer should see.
router.get("/", getBins);
router.get("/:id", getBinById);

// Only admin/staff manage the physical bin fleet.
router.post("/", authorize("admin", "staff"), createBin);
router.patch("/:id", authorize("admin", "staff"), updateBin);
router.delete("/:id", authorize("admin", "staff"), deleteBin);

module.exports = router;
