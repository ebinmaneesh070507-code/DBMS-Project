const express = require("express");
const { getBins, getBinById, createBin, updateBin, deleteBin } = require("../controllers/binController");

const router = express.Router();

router.get("/", getBins);
router.get("/:id", getBinById);
router.post("/", createBin);
router.patch("/:id", updateBin);
router.delete("/:id", deleteBin);

module.exports = router;
