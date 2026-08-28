require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const healthRoutes = require("./routes/health");
const wasteRoutes = require("./routes/waste");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/waste", wasteRoutes);

// Root
app.get("/", (req, res) => {
  res.json({
    name: "EcoMind API",
    message: "AI-powered smart waste management backend",
    status: "running"
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

app.listen(PORT, () => {
  console.log(`EcoMind server running at http://localhost:${PORT}`);
});