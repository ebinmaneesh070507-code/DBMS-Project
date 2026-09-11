const express = require("express");
const { register, login, getMe, googleLogin, setMyRole } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/me", protect, getMe);
router.patch("/role", protect, setMyRole);

module.exports = router;
