import jwt from "jsonwebtoken";
import Realtor from "../models/realtor.model.js";
import Admin from "../models/admin.js";
import Client from "../models/client.model.js";
import { verifyCsrf } from "./csrf.js";

// Reads the Bearer header (existing, unchanged behavior) or falls back to
// the access_token cookie (Phase 5 addition — PRD FR-4 dual-credential
// window). Bearer takes precedence so client-legacy's existing requests
// are completely unaffected.
function extractToken(req) {
  if (req.headers.authorization?.startsWith("Bearer ")) {
    return { token: req.headers.authorization.split(" ")[1], viaCookie: false };
  }
  if (req.cookies?.access_token) {
    return { token: req.cookies.access_token, viaCookie: true };
  }
  return { token: null, viaCookie: false };
}

/**
 * Protect routes (Admin + Realtor + Client)
 * Original protect middleware — UNCHANGED, still handles Admin & Realtor
 */
export const protect = async (req, res, next) => {
  try {
    const { token, viaCookie } = extractToken(req);

    if (!token) {
      return res.status(401).json({ message: "Not authorized. No token." });
    }

    if (viaCookie && !verifyCsrf(req)) {
      return res.status(403).json({ message: "CSRF validation failed." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 1️⃣ Try Admin first
    let user = await Admin.findById(decoded.id).select("_id email");
    if (user) {
      req.user = {
        _id: user._id,
        id: user._id,
        email: user.email,
        role: "admin",
      };
      return next();
    }

    // 2️⃣ Try Realtor
    user = await Realtor.findById(decoded.id).select(
      "_id email role firstName lastName referralCode",
    );
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      _id: user._id,
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      referralCode: user.referralCode,
    };

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

/**
 * Client-only guard — new, does not affect existing routes
 */
export const protectClient = async (req, res, next) => {
  try {
    const { token, viaCookie } = extractToken(req);

    if (!token) {
      return res.status(401).json({ message: "Not authorized. No token." });
    }

    if (viaCookie && !verifyCsrf(req)) {
      return res.status(403).json({ message: "CSRF validation failed." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "client") {
      return res
        .status(403)
        .json({ message: "Access denied. Client account required." });
    }

    const client = await Client.findById(decoded.id).select(
      "_id email role firstName lastName isActive",
    );

    if (!client) {
      return res.status(401).json({ message: "Client account not found." });
    }

    if (!client.isActive) {
      return res
        .status(403)
        .json({ message: "Account suspended. Contact support." });
    }

    req.user = {
      _id: client._id,
      id: client._id,
      email: client.email,
      role: client.role,
      firstName: client.firstName,
      lastName: client.lastName,
    };

    next();
  } catch (error) {
    console.error("Client auth error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

/**
 * Admin-only guard — UNCHANGED
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin privileges required.",
    });
  }
  next();
};

/**
 * Admin protected routes — UNCHANGED
 */
export const protectAdmin = [protect, isAdmin];
