const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

// Emails in ADMIN_EMAILS (comma-separated) always get the "admin" role,
// regardless of what the client sends. Everyone else registers as a
// "citizen" (shown to users as "Viewer"). This is intentional: a client
// should never be able to self-escalate to admin by sending role="admin"
// in the request body.
const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const resolveRole = (email) => (adminEmails.includes(email.toLowerCase()) ? "admin" : "citizen");

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw new ApiError(400, "name, email and password are required");
  if (password.length < 6) throw new ApiError(400, "password must be at least 6 characters");

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(409, "A user with this email already exists");

  const user = await User.create({ name, email, password, role: resolveRole(email) });
  res.status(201).json({
    success: true,
    data: publicUser(user),
    token: signToken(user._id),
  });
});

// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "email and password are required");

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  // If this account's email is in ADMIN_EMAILS but was created before the
  // env var was set (or role drifted), silently self-heal it on login.
  const correctRole = resolveRole(user.email);
  if (user.role !== correctRole && correctRole === "admin") {
    user.role = "admin";
    await user.save();
  }

  res.json({
    success: true,
    data: publicUser(user),
    token: signToken(user._id),
  });
});

// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: publicUser(req.user) });
});

module.exports = { register, login, getMe };
