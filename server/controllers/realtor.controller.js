import Realtor from "../models/realtor.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary.config.js";
import crypto from "crypto";
import { escapeRegex } from "../utils/escapeRegex.js";
import {
  sendEmail,
  sendSMS,
  notifyRealtorWelcomeSMS,
} from "../utils/notifications.js";
import { issueAuthCookies } from "../utils/authTokens.js";
import { getLockoutStatus, recordFailedLogin, recordSuccessfulLogin } from "../utils/loginLockout.js";

/* ────────────────────────────────────────────────────────────────────────────
   HELPERS
──────────────────────────────────────────────────────────────────────────── */

const generateReferralCode = async () => {
  let code,
    exists = true;
  while (exists) {
    const count = await Realtor.countDocuments();
    const rand = Math.floor(10 + Math.random() * 90);
    code = `kem${String(count + 1).padStart(3, "0")}${rand}`;
    exists = await Realtor.exists({ referralCode: code });
  }
  return code;
};

const FRONTEND = () =>
  process.env.FRONTEND_URL || "https://kemchutahomesltd.com";

/* ────────────────────────────────────────────────────────────────────────────
   AUTH
──────────────────────────────────────────────────────────────────────────── */

export const signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      state,
      bank,
      accountName,
      accountNumber,
      password,
      ref,
      birthDate,
      avatar,
    } = req.body;

    if (await Realtor.findOne({ email })) {
      return res.status(400).json({ message: "Email already registered" });
    }

    let recruiter = null;
    if (ref?.trim()) {
      recruiter = await Realtor.findOne({ referralCode: ref.trim() });
      if (!recruiter)
        return res.status(400).json({ message: "Invalid referral code" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const referralCode = await generateReferralCode();

    const realtor = await Realtor.create({
      firstName,
      lastName,
      email,
      phone,
      state,
      bank,
      accountName,
      accountNumber,
      avatar: avatar || undefined,
      passwordHash,
      referralCode,
      birthDate: new Date(birthDate),
      recruitedBy: recruiter?._id || null,
    });

    // ── Welcome email ─────────────────────────────────────────────────────
    const referralLink = `${FRONTEND()}/signup?ref=${referralCode}`;
    const welcomeHtml = `
      <!DOCTYPE html><html><head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(112,12,235,0.1);">
        <div style="background:linear-gradient(135deg,#3F0C91,#700CEB);padding:44px 32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;text-transform:uppercase;letter-spacing:-0.5px;">Kemchuta Homes</h1>
          <span style="display:inline-block;background:rgba(255,255,255,0.2);color:#fff;font-size:11px;font-weight:700;padding:4px 14px;border-radius:20px;margin-top:10px;letter-spacing:1px;">REALTOR WELCOME</span>
        </div>
        <div style="padding:40px 36px;">
          <h2 style="color:#0f0a1e;font-size:22px;font-weight:900;margin:0 0 12px;">Welcome, ${firstName}! 🎉</h2>
          <p style="color:#374151;font-size:15px;line-height:1.75;margin:0 0 24px;">
            You have been successfully registered as a Kemchuta Homes realtor. You can now start earning commissions by referring clients to our estates.
          </p>
          <div style="background:#f9f6ff;border-radius:12px;padding:20px 24px;margin:0 0 24px;border-left:4px solid #700CEB;">
            <p style="margin:5px 0;font-size:13px;color:#374151;"><strong>Your Referral Code:</strong> <strong style="color:#700CEB;font-size:16px;">${referralCode}</strong></p>
            <p style="margin:5px 0;font-size:13px;color:#374151;"><strong>Your Referral Link:</strong></p>
            <p style="margin:5px 0;font-size:12px;word-break:break-all;"><a href="${referralLink}" style="color:#700CEB;">${referralLink}</a></p>
          </div>
          <div style="text-align:center;margin:28px 0;">
            <a href="${FRONTEND()}/login" style="display:inline-block;background:linear-gradient(135deg,#3F0C91,#700CEB);color:#fff;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;">Log In to Your Dashboard</a>
          </div>
          <p style="color:#6b7280;font-size:13px;text-align:center;margin:0;">Share your referral link and earn commissions on every successful subscription.</p>
        </div>
        <div style="background:#0f0a1e;padding:20px 36px;text-align:center;">
          <p style="color:#6b7280;font-size:11px;margin:0;">© ${new Date().getFullYear()} Kemchuta Homes Limited · info@kemchutahomesltd.com</p>
        </div>
      </div></body></html>`;

    // Fire email + SMS — non-blocking
    Promise.allSettled([
      sendEmail({
        to: realtor.email,
        subject: "Welcome to Kemchuta Homes — Your Realtor Account is Ready!",
        html: welcomeHtml,
      }),
      notifyRealtorWelcomeSMS({
        firstName,
        phone,
        referralCode,
        referralLink,
      }),
    ]).catch(() => null);

    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: realtor._id,
        name: `${realtor.firstName} ${realtor.lastName}`,
        referralCode: realtor.referralCode,
        referralLink: realtor.referralLink,
      },
    });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    return res.status(500).json({ message: "Signup failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const realtor = await Realtor.findOne({ email });
    if (!realtor) return res.status(404).json({ message: "Realtor not found" });

    const lockStatus = getLockoutStatus(realtor);
    if (lockStatus.locked) {
      return res.status(423).json({
        message: `Too many failed attempts. Try again in ${lockStatus.minutesLeft} minute(s).`,
      });
    }

    const isMatch = await bcrypt.compare(password, realtor.passwordHash);
    if (!isMatch) {
      await recordFailedLogin(realtor);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    await recordSuccessfulLogin(realtor);

    const token = jwt.sign(
      { id: realtor._id, role: realtor.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    await issueAuthCookies(res, { id: realtor._id, role: realtor.role });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: realtor._id,
        firstName: realtor.firstName,
        lastName: realtor.lastName,
        email: realtor.email,
        role: realtor.role,
        avatar: realtor.avatar,
        referralCode: realtor.referralCode,
        referralLink: realtor.referralLink,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};

/* ────────────────────────────────────────────────────────────────────────────
   DASHBOARD
──────────────────────────────────────────────────────────────────────────── */

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const realtor = await Realtor.findById(userId)
      .populate("recruitedBy", "firstName lastName role")
      .exec();

    if (!realtor) return res.status(404).json({ message: "User not found" });

    const realtorObj = realtor.toObject({ virtuals: true });
    const recruitCount = await Realtor.countDocuments({ recruitedBy: userId });

    let recruitedByLabel = "Admin";
    if (realtorObj.recruitedBy && typeof realtorObj.recruitedBy === "object") {
      recruitedByLabel =
        realtorObj.recruitedBy.role === "admin"
          ? "Admin"
          : `${realtorObj.recruitedBy.firstName} ${realtorObj.recruitedBy.lastName}`;
    }

    return res.json({
      firstName: realtorObj.firstName,
      lastName: realtorObj.lastName,
      name: `${realtorObj.firstName} ${realtorObj.lastName}`,
      avatar: realtorObj.avatar || null,
      downlines: recruitCount,
      recruitedBy: recruitedByLabel,
      referralCode: realtorObj.referralCode,
      referralLink: realtorObj.referralLink,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ────────────────────────────────────────────────────────────────────────────
   MY RECRUITS
──────────────────────────────────────────────────────────────────────────── */

export const getMyRecruits = async (req, res) => {
  try {
    const recruits = await Realtor.find({ recruitedBy: req.user.id })
      .select("firstName lastName email phone avatar referralCode createdAt")
      .sort("-createdAt")
      .lean();

    return res.json({ recruits, total: recruits.length });
  } catch (error) {
    console.error("Get My Recruits Error:", error);
    res.status(500).json({ message: "Failed to fetch recruits" });
  }
};

/* ────────────────────────────────────────────────────────────────────────────
   PROFILE
──────────────────────────────────────────────────────────────────────────── */

export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const uploadFromBuffer = (buffer) =>
      new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "kemchuta/avatars",
              transformation: { width: 400, height: 400, crop: "fill" },
            },
            (err, result) => (err ? reject(err) : resolve(result)),
          )
          .end(buffer);
      });

    const result = await uploadFromBuffer(req.file.buffer);
    const updated = await Realtor.findByIdAndUpdate(
      req.user.id,
      { avatar: result.secure_url },
      { new: true },
    ).select("firstName lastName avatar referralCode email role");

    return res.json({
      message: "Avatar updated",
      avatar: result.secure_url,
      user: {
        id: updated._id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        role: updated.role,
        avatar: updated.avatar,
        referralCode: updated.referralCode,
      },
    });
  } catch (err) {
    console.error("AVATAR UPLOAD ERROR:", err);
    return res.status(500).json({ message: "Avatar upload failed" });
  }
};

/* ────────────────────────────────────────────────────────────────────────────
   ADMIN — REALTOR MANAGEMENT
──────────────────────────────────────────────────────────────────────────── */

export const getRealtors = async (req, res) => {
  try {
    const page = Math.max(+req.query.page || 1, 1);
    const limit = Math.min(+req.query.limit || 10, 100);
    const search = req.query.search || "";

    const safeSearch = escapeRegex(String(search).slice(0, 100));
    const filter = search
      ? {
          $or: [
            { firstName: { $regex: safeSearch, $options: "i" } },
            { lastName: { $regex: safeSearch, $options: "i" } },
            { email: { $regex: safeSearch, $options: "i" } },
            { referralCode: { $regex: safeSearch, $options: "i" } },
          ],
        }
      : {};

    const total = await Realtor.countDocuments(filter);
    const realtors = await Realtor.find(filter)
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("recruitedBy", "firstName lastName referralCode")
      .lean();

    const docs = realtors.map((r) => ({
      ...r,
      name: `${r.firstName} ${r.lastName}`,
      recruitedByName: r.recruitedBy
        ? `${r.recruitedBy.firstName} ${r.recruitedBy.lastName}`
        : null,
    }));

    return res.json({ docs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("GET REALTORS ERROR:", err);
    return res.status(500).json({ message: "Failed to fetch realtors" });
  }
};

export const getRealtorById = async (req, res) => {
  try {
    const realtor = await Realtor.findById(req.params.id)
      .populate("recruitedBy", "firstName lastName referralCode")
      .select("-passwordHash");
    if (!realtor) return res.status(404).json({ message: "Realtor not found" });
    res.json(realtor);
  } catch (err) {
    console.error("GET REALTOR ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateRealtor = async (req, res) => {
  try {
    const updated = await Realtor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");
    if (!updated) return res.status(404).json({ message: "Realtor not found" });
    res.json({ message: "Updated successfully", realtor: updated });
  } catch (err) {
    console.error("UPDATE REALTOR ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

export const deleteRealtor = async (req, res) => {
  try {
    const recruits = await Realtor.countDocuments({
      recruitedBy: req.params.id,
    });
    if (recruits > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete realtor with recruits" });
    }
    await Realtor.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE REALTOR ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

/* ────────────────────────────────────────────────────────────────────────────
   FORGOT / RESET PASSWORD
──────────────────────────────────────────────────────────────────────────── */

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const realtor = await Realtor.findOne({
      email: email.toLowerCase().trim(),
    });
    // Always 200 — prevents email enumeration
    if (!realtor) {
      return res
        .status(200)
        .json({ message: "If that email exists, a reset link has been sent." });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    realtor.resetPasswordToken = hashedToken;
    realtor.resetPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    await realtor.save({ validateBeforeSave: false });

    const resetUrl = `${FRONTEND()}/reset-password?token=${rawToken}`;

    sendEmail({
      to: realtor.email,
      subject: "Reset Your Kemchuta Homes Password",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
          <h2 style="color:#0f0a1e;">Password Reset Request</h2>
          <p style="color:#374151;">Hi ${realtor.firstName},</p>
          <p style="color:#374151;">Click the button below to reset your password. This link expires in 1 hour.</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${resetUrl}" style="background:#700CEB;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">Reset Password</a>
          </div>
          <p style="color:#9ca3af;font-size:12px;">If you did not request this, ignore this email.</p>
        </div>`,
    }).catch(async () => {
      realtor.resetPasswordToken = undefined;
      realtor.resetPasswordExpiry = undefined;
      await realtor.save({ validateBeforeSave: false }).catch(() => null);
    });

    return res
      .status(200)
      .json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

export const resetPassword = async (req, res) => {
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
    const realtor = await Realtor.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!realtor) {
      return res
        .status(400)
        .json({ message: "Reset link is invalid or has expired." });
    }

    realtor.passwordHash = await bcrypt.hash(password, 12);
    realtor.resetPasswordToken = undefined;
    realtor.resetPasswordExpiry = undefined;
    await realtor.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};
