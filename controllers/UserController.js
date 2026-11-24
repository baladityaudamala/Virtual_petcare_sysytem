// controllers/UserController.js — Sequelize version
require("dotenv").config();
const { User, ConfirmToken } = require("../models/index");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");

module.exports = {
  // ================= REGISTER =================
  register: async (req, res) => {
    try {
      const { email, password, passwordCheck, firstName, lastName } = req.body;

      if (!email || !password || !passwordCheck || !firstName)
        return res.status(400).json({ msg: "All fields are required (except last name)" });

      if (password !== passwordCheck)
        return res.status(400).json({ msg: "Passwords do not match" });

      if (password.length < 8)
        return res.status(400).json({ msg: "Password must be at least 8 chars" });

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        console.log("Register Failed: User already exists");
        return res.status(400).json({ msg: "User already exists" });
      }

      const displayName = lastName ? `${firstName} ${lastName}` : firstName;
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        email,
        password: passwordHash,
        displayName,
        confirmed: false,
      });

      // Create confirmation token
      const tokenValue = crypto.randomBytes(16).toString("hex");
      await ConfirmToken.create({ userId: newUser.id, token: tokenValue });

      // Send Verification Email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAIL_USER,
          pass: (process.env.MAIL_PASS || "").replace(/\s/g, ""),
        },
      });

      const baseUrl = process.env.SERVER_URL || process.env.RENDER_EXTERNAL_URL || "http://localhost:5000";
      const url = `${baseUrl}/confirm/verify/${tokenValue}`;

      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: "Verify your Account",
        html: `<h3>Click the link to verify your account: <a href="${url}">Verify Email</a></h3>`,
      });

      res.status(201).json({
        msg: "Registration successful! Please check your email to verify your account.",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: err.message });
    }
  },

  // ================= LOGIN =================
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ msg: "All fields required" });

      const user = await User.findOne({ where: { email } });
      if (!user) {
        console.log("Login Failed: User not found");
        return res.status(400).json({ msg: "User not found" });
      }

      if (!user.confirmed) {
        console.log("Login Failed: User not confirmed");
        return res.status(400).json({ msg: "Please verify your email before logging in." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("Login Failed: Password mismatch");
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "24h" });

      res.json({
        token,
        user: {
          id: user.id,
          _id: user.id, // alias for frontend compatibility
          displayName: user.displayName,
          email: user.email,
          confirmed: true,
        },
      });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // ================= GET USER =================
  getUser: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ["password"] },
      });
      if (!user) return res.status(404).json({ msg: "User not found" });
      const u = user.toJSON();
      u._id = u.id;
      res.json(u);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // ================= DELETE USER =================
  deleteUser: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ msg: "User not found" });
      await user.destroy(); // cascades to pets, tokens etc.
      res.json({ msg: "User deleted successfully" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // ================= FORGOT PASSWORD =================
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(400).json({ msg: "User with this email does not exist" });

      const tokenValue = crypto.randomBytes(20).toString("hex");
      await ConfirmToken.create({ userId: user.id, token: tokenValue });

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAIL_USER,
          pass: (process.env.MAIL_PASS || "").replace(/\s/g, ""),
        },
      });

      const baseUrl = process.env.CLIENT_URL || process.env.RENDER_EXTERNAL_URL || "http://localhost:3000";
      const url = `${baseUrl}/reset-password/${tokenValue}`;

      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: "Reset Password",
        html: `<h3>Click the link to reset your password: <a href="${url}">Reset Password</a></h3>`,
      });

      res.json({ msg: "Password reset link sent to your email." });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // ================= RESET PASSWORD =================
  resetPassword: async (req, res) => {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      if (newPassword !== confirmPassword)
        return res.status(400).json({ msg: "Passwords do not match" });

      // Check token and ensure it was created within the last 1 hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const confirmToken = await ConfirmToken.findOne({
        where: {
          token,
          createdAt: { [Op.gte]: oneHourAgo },
        },
      });
      if (!confirmToken) return res.status(400).json({ msg: "Invalid or expired token" });

      const user = await User.findByPk(confirmToken.userId);
      if (!user) return res.status(400).json({ msg: "User not found" });

      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      await ConfirmToken.destroy({ where: { token } });

      res.json({ msg: "Password reset successfully. You can now login." });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
};
