const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Emails listed here (comma-separated in .env, e.g. ADMIN_EMAILS=you@gmail.com,other@gmail.com)
// are automatically granted the "admin" role the moment they sign in with
// Google — no manual DB edit needed.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const roleForEmail = (email) => (ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : "citizen");

// @route POST /api/auth/register
// @desc  Fallback email/password registration (Google Sign-In is the primary
//        flow). Role is never taken from the request — only ADMIN_EMAILS or
//        the role-picker (PATCH /api/auth/role) can set it, so this can't be
//        used to self-assign admin.
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw new ApiError(400, "name, email and password are required");

  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, "A user with this email already exists");

  const role = roleForEmail(email);
  const user = await User.create({ name, email, password, role, roleConfirmed: role === "admin" });
  res.status(201).json({
    success: true,
    data: { id: user._id, name: user.name, email: user.email, role: user.role, roleConfirmed: user.roleConfirmed },
    token: signToken(user._id),
  });
});

// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "email and password are required");

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  res.json({
    success: true,
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
    token: signToken(user._id),
  });
});

// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

// @route POST /api/auth/google
// @desc  Verify a Google Identity Services ID token, create/update the user,
//        and issue our own JWT. Any email listed in ADMIN_EMAILS always becomes "admin".
const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential) throw new ApiError(400, "Missing Google credential");
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new ApiError(500, "GOOGLE_CLIENT_ID is not configured on the server");
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    throw new ApiError(401, "Invalid Google credential");
  }

  const { sub: googleId, email, name, picture, email_verified: emailVerified } = payload;
  if (!emailVerified) throw new ApiError(401, "Google email is not verified");

  let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });
  const correctRole = roleForEmail(email);
  const isNewUser = !user;

  if (user) {
  // Keep profile fresh and re-evaluate admin status on every login, in case
  // ADMIN_EMAILS was updated after the account was first created.
  user.googleId = googleId;
  user.name = user.name || name;
  user.picture = picture;
  if (user.role !== "admin" || correctRole === "admin") user.role = correctRole;
  if (correctRole === "admin") user.roleConfirmed = true;
  await user.save();
} else {
    user = await User.create({
      name,
      email: email.toLowerCase(),
      googleId,
      picture,
      // New non-admin users start as "citizen"; they choose Citizen vs
      // Responder on their first visit via PATCH /api/auth/role.
      role: correctRole,
      roleConfirmed: correctRole === "admin",
    });
  }

  res.json({
    success: true,
    isNewUser,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      picture: user.picture,
      roleConfirmed: user.roleConfirmed,
    },
    token: signToken(user._id),
  });
});

// @route PATCH /api/auth/role
// @desc  Lets a non-admin user choose to act as a "citizen" (reporter) or
//        "responder" (response team) — this IS the simulation's role picker.
//        Admins cannot be reassigned this way (their role is fixed by ADMIN_EMAILS).
const setMyRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!["citizen", "responder"].includes(role)) {
    throw new ApiError(400, 'role must be "citizen" or "responder"');
  }
  if (req.user.role === "admin") {
    throw new ApiError(400, "Admin accounts already have full access and can't switch roles");
  }

  req.user.role = role;
  req.user.roleConfirmed = true;
  await req.user.save();

  res.json({ success: true, data: req.user });
});

module.exports = { register, login, getMe, googleLogin, setMyRole };
