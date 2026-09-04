const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const scannerRoutes = require("./routes/scannerRoutes");
const reportRoutes = require("./routes/reportRoutes");
const binRoutes = require("./routes/binRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const collectionRoutes = require("./routes/collectionRoutes");
const dumpingRoutes = require("./routes/dumpingRoutes");
const assistantRoutes = require("./routes/assistantRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

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

// Serve uploaded images (waste scans, reports, dumping evidence)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// --- Health check ---
app.get("/api/health", (req, res) => res.json({ success: true, message: "EcoMind API is running" }));

// --- Feature routes (mirrors the frontend's pages) ---
app.use("/api/auth", authRoutes);
app.use("/api/scanner", scannerRoutes); // AI Waste Scanner
app.use("/api/reports", reportRoutes); // Waste Reporting Page
app.use("/api/bins", binRoutes); // Smart Bin Monitoring
app.use("/api/predictions", predictionRoutes); // Waste Prediction Page
app.use("/api/collection", collectionRoutes); // Smart Collection Page
app.use("/api/dumping-reports", dumpingRoutes); // Illegal Dumping Reports
app.use("/api/assistant", assistantRoutes); // AI Database Assistant
app.use("/api/dashboard", dashboardRoutes); // Smart Dashboard + AI Insights

// --- Errors ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
