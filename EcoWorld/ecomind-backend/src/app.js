const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const scannerRoutes = require("./routes/scannerRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const teamsRoutes = require("./routes/teamsRoutes");
const assistantRoutes = require("./routes/assistantRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const zoneRoutes = require("./routes/zoneRoutes");

const app = express();

// --- Global middleware ---
app.use(helmet({ crossOriginResourcePolicy: false })); // allow images to be served cross-origin to the frontend
app.use(
  cors({
    origin: (process.env.CLIENT_URL || "*").split(",").map((s) => s.trim()),
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

// Basic rate limiting on the API surface
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Serve uploaded images (incident photos, waste scans)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// --- Health check ---
app.get("/api/health", (req, res) => res.json({ success: true, message: "EcoMind API is running" }));

// --- Feature routes (mirrors the frontend's pages) ---
app.use("/api/auth", authRoutes);
app.use("/api/zones", zoneRoutes); // campus zones (reference data, admin-managed)
app.use("/api/scanner", scannerRoutes); // AI Waste Scanner (single-item classification)
app.use("/api/incidents", incidentRoutes); // AI-triaged area reports + responder dispatch
app.use("/api/predictions", predictionRoutes); // real trend analysis by zone
app.use("/api/teams", teamsRoutes); // admin view of response teams
app.use("/api/assistant", assistantRoutes); // AI Database Assistant
app.use("/api/dashboard", dashboardRoutes); // live analytics + AI insights

// --- Errors ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
