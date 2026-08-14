import express from "express";
import {
  registerClient,
  loginClient,
  getClientProfile,
  getClientDashboard,
  forgotPassword,
  resetPassword,
  checkEmailExists,
  getClientInspections,
} from "../controllers/client.controller.js";
import { protectClient } from "../middlewares/authMiddleware.js";
import { authLimiter } from "../middlewares/rateLimiters.js";
import { validate } from "../middlewares/validate.js";
import {
  registerClientSchema,
  loginClientSchema,
  clientForgotPasswordSchema,
  clientResetPasswordSchema,
  checkEmailQuerySchema,
} from "../schemas/client.schema.js";

const router = express.Router();

// ── Public ─────────────────────────────────────────────────────────────────
router.post(
  "/register",
  authLimiter,
  validate(registerClientSchema),
  registerClient,
);
router.post("/login", authLimiter, validate(loginClientSchema), loginClient);
router.post(
  "/forgot-password",
  authLimiter,
  validate(clientForgotPasswordSchema),
  forgotPassword,
);
router.post(
  "/reset-password",
  authLimiter,
  validate(clientResetPasswordSchema),
  resetPassword,
);
router.get(
  "/check-email",
  authLimiter,
  validate(checkEmailQuerySchema, "query"),
  checkEmailExists,
);

// ── Protected (client token) ───────────────────────────────────────────────
router.get("/me", protectClient, getClientProfile);
router.get("/dashboard", protectClient, getClientDashboard);
router.get("/inspections", protectClient, getClientInspections);

export default router;
