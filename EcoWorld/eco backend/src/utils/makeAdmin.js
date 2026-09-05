/**
 * makeAdmin.js
 * -------------------------------------------------------------------------
 * Command-line tool to grant a user the "admin" role.
 *
 * Usage:
 *   npm run make-admin -- kanwarzen642@gmail.com
 *   npm run make-admin -- kanwarzen642@gmail.com "Kanwar" "a-temp-password123"
 *
 * - If the email already has an account, it is promoted to admin in place.
 * - If it doesn't exist yet, a new admin account is created (name/password
 *   are optional; sensible defaults are used and printed back to you so you
 *   can log in and change them).
 *
 * Note: any email listed in ADMIN_EMAILS in your .env is auto-promoted to
 * admin the moment it registers or logs in, so for kanwarzen642@gmail.com
 * this script is a convenience/repair tool rather than strictly required —
 * but it's the fastest way to get admin access set up right now.
 * -------------------------------------------------------------------------
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const run = async () => {
  const [, , emailArg, nameArg, passwordArg] = process.argv;

  if (!emailArg) {
    console.error("\nUsage: npm run make-admin -- <email> [name] [password]\n");
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();
  await connectDB();

  let user = await User.findOne({ email });

  if (user) {
    user.role = "admin";
    await user.save();
    console.log(`\n[make-admin] "${email}" already had an account — promoted to admin.`);
    console.log(`[make-admin] Log in with their existing password.\n`);
  } else {
    const name = nameArg || email.split("@")[0];
    const password = passwordArg || `EcoMind@${Math.floor(100000 + Math.random() * 900000)}`;
    user = await User.create({ name, email, password, role: "admin" });
    console.log(`\n[make-admin] Created a new admin account for "${email}".`);
    console.log(`[make-admin] Name:     ${name}`);
    console.log(`[make-admin] Password: ${password}`);
    console.log(`[make-admin] Log in with this password, then change it (from the API — there's no`);
    console.log(`[make-admin] change-password endpoint yet, so re-run this script to reset it if needed).\n`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("[make-admin] Failed:", err.message);
  process.exit(1);
});
