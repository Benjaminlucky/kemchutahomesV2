import jwt from "jsonwebtoken";
import Admin from "../models/admin.js";
import crypto from "crypto";
import { sendAdminPasswordResetEmail } from "../utils/email.js";
import { issueAuthCookies } from "../utils/authTokens.js";
import { getLockoutStatus, recordFailedLogin, recordSuccessfulLogin } from "../utils/loginLockout.js";

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: "admin" }, // ✅ include role
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

export const signupAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existing = await Admin.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Admin already exists" });

    const admin = await Admin.create({ email, password });
    const token = generateToken(admin);
    await issueAuthCookies(res, { id: admin._id, role: "admin" });

    res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: admin._id,
        email: admin.email,
        role: "admin",
        firstName: admin.firstName || "",
        lastName: admin.lastName || "",
      },
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Signup failed" });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    const lockStatus = getLockoutStatus(admin);
    if (lockStatus.locked) {
      return res.status(423).json({
        message: `Too many failed attempts. Try again in ${lockStatus.minutesLeft} minute(s).`,
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      await recordFailedLogin(admin);
      return res.status(400).json({ message: "Invalid credentials" });
    }
    await recordSuccessfulLogin(admin);

    const token = generateToken(admin);
    await issueAuthCookies(res, { id: admin._id, role: "admin" });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: admin._id,
        email: admin.email,
        role: "admin",
        firstName: admin.firstName || "",
        lastName: admin.lastName || "",
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

/* ─────────────────────── ADMIN FORGOT PASSWORD ───────────────────────────── */

export const forgotAdminPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    // Always return 200 — prevents email enumeration
    if (!admin) {
      return res.status(200).json({
        message: "If that email exists, a reset link has been sent.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    admin.resetPasswordToken = hashedToken;
    admin.resetPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

    // Use { validateBeforeSave: false } to skip password re-hashing
    await admin.save({ validateBeforeSave: false });

    const FRONTEND_URL =
      process.env.FRONTEND_URL || "https://kemchutahomesltd.com";
    const resetUrl = `${FRONTEND_URL}/admin/reset-password?token=${rawToken}`;

    sendAdminPasswordResetEmail({ email: admin.email, resetUrl }).catch(
      async () => {
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpiry = undefined;
        await admin.save({ validateBeforeSave: false }).catch(() => null);
      },
    );

    return res.status(200).json({
      message: "If that email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("ADMIN FORGOT PASSWORD ERROR:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

/* ─────────────────────── ADMIN RESET PASSWORD ────────────────────────────── */

export const resetAdminPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!admin) {
      return res
        .status(400)
        .json({ message: "Reset link is invalid or has expired." });
    }

    // ✅ Set plain password — the pre("save") hook will hash it automatically
    admin.password = password;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpiry = undefined;
    await admin.save(); // ← No validateBeforeSave:false here so the hook runs

    return res
      .status(200)
      .json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    console.error("ADMIN RESET PASSWORD ERROR:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};
