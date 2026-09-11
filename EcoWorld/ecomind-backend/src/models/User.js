const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Not required: accounts created via Google Sign-In never set a password.
    password: { type: String, minlength: 6, select: false },
    googleId: { type: String, unique: true, sparse: true },
    picture: { type: String },
    // "admin" = full visibility, can see and act as both other roles (simulation mode).
    // "responder" = a response-team member who claims and resolves incidents.
    // "citizen" = reports incidents and tracks their own contributions.
    role: { type: String, enum: ["admin", "responder", "citizen"], default: "citizen" },
    // False until the user has explicitly picked Citizen vs Responder (or is admin).
    // The frontend shows a role-picker screen while this is false.
    roleConfirmed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (enteredPassword) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
