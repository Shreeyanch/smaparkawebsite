// import userModel from "../models/userModel.js";
// import generateToken from "../config/generateToken.js";
// import bcrypt from "bcrypt";
// import messageModel from "../models/messageModel.js";
// import MailController from "./mailController.js";
// import smsFeeModel from "../models/smsFeeModel.js";
const userModel = require("../models/userModel");
const generateToken = require("../config/generateToken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const messageModel = require("../models/messageModel");
const mailcontroller = require("./mailController");
const nodemailer = require("nodemailer");

const smsFeeModel = require("../models/smsFeeModel");

const CLIENT_URL = process.env.CLIENT_ORIGIN || "http://localhost:5173"; // your frontend URL

class UserController {
  //User Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      //check empty fields
      if (!email || !password) {
        return res.json({ success: false, message: "All fields are required" });
      }

      //check email
      let user = await userModel.findOne({ email });
      if (!user) {
        return res.json({
          success: false,
          message: "Credentials do not match.",
        });
      }

      // check password
      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
        return res.json({
          success: false,
          message: "Credentials do not match.",
        });
      }

      user = await userModel.findById(user._id).select("-password -otp");

      if (user.status == "active") {
        return res.status(200).json({
          success: true,
          message: "Login Successful",
          userData: user,
          token: generateToken(user._id, null, user.tokenVersion),
        });
      } else {
        return res.json({
          success: false,
          message: "Your account is not active. Please contact support.",
        });
      }
    } catch (error) {
      console.log(error);

      return res.status(500).send(error);
    }
  }

  // Forget Password
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await userModel.findOne({ email });

      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      user.resetPasswordToken = resetTokenHash;
      user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // valid for 15 mins
      await user.save();

      // Send email
      const resetLink = `${CLIENT_URL}/reset-password/${resetToken}`;
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Samparka Support" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Password Reset Request",
        html: `
        <p>Hello ${user.name || "User"},</p>
        <p>You requested to reset your password. Click the link below to create a new password:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
      });

      res.json({
        success: true,
        message: "Password reset link sent to your email.",
      });
    } catch (error) {
      console.error("Forgot Password Error:", error);
      res.status(500).send(error);
    }
  }

  // Change Password
  async changePassword(req, res) {
    try {
      const resetTokenHash = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

      const user = await userModel.findOne({
        resetPasswordToken: resetTokenHash,
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (!user)
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired token" });

      const { password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.json({ success: true, message: "Password reset successful." });
    } catch (error) {
      console.error("Reset Password Error:", error);
      res.status(500).send(error);
    }
  }

  //Message Scheduling
  async scheduleMessage(req, res) {
    try {
      const { title, message, dateandtime } = req.body;
      if (!title || !message || !dateandtime) {
        return res.json({ success: false, message: "All fields are required" });
      }
      if (message.length > 100) {
        return res.json({
          success: false,
          message: "Your message should not me more than 100 characters.",
        });
      }
      const messageSchedule = await messageModel.create({
        ...req.body,
        createdBy: req.user,
      });

      const mailResponse = await mailcontroller.notifyAdmin(req.user.email);

      return res.json({
        success: true,
        message: "Message submitted successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }

  //Message History
  async fetchMessageHistory(req, res) {
    try {
      const messages = await messageModel.find({ createdBy: req.user });

      return res.json({ success: true, messages });
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }

  //SMS Fee
  async getSMSFee(req, res) {
    try {
      const smsFee = await smsFeeModel.findOne();
      if (smsFee) {
        res.json({ success: true, fee: smsFee.amount });
      } else {
        res.json({ success: false, message: "SMS fee not set." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error." });
    }
  }
}

module.exports = new UserController();
