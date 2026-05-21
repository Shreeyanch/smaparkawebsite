const mongoose = require("mongoose");

const userModel = mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Make optional for OAuth users
    username: { type: String }, // Display name chosen by user
    name: { type: String }, // Full name from Google or user input
    picture: { type: String }, // Google profile picture
    country: { type: String }, // Country/Region
    googleId: { type: String, unique: true, sparse: true }, // Google's unique ID (sub)
    authProvider: { 
      type: String, 
      enum: ["local", "google"], 
      default: "local" 
    },
    role: { type: String, required: true, default: "user" },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked", "pending_verification"],
      required: true,
      default: "active",
    },
    emailVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationCodeExpire: { type: Date },
    // Temporary storage for Google OAuth data during signup flow
    pendingGoogleData: {
      googleId: String,
      email: String,
      name: String,
      picture: String,
    },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    tokenVersion: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userModel);