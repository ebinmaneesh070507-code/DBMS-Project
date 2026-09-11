const express = require("express");
const { ask } = require("../controllers/assistantController");

const router = express.Router();

router.post("/ask", ask);

module.exports = router;
