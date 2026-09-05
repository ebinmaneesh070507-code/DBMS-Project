require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[EcoMind API] Running on http://localhost:${PORT} (${process.env.NODE_ENV || "development"})`);
  });
};

start();

// Safety nets so the process logs and exits cleanly instead of hanging
process.on("unhandledRejection", (err) => {
  console.error(`[Unhandled Rejection] ${err.message}`);
  process.exit(1);
});
