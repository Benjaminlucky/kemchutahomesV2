import express from "express";
import {
  forgotAdminPassword,
  loginAdmin,
  resetAdminPassword,
  signupAdmin,
} from "../controllers/adminController.js";
import { authLimiter } from "../middlewares/rateLimiters.js";
import { requireInviteToken } from "../middlewares/requireInviteToken.js";
import { validate } from "../middlewares/validate.js";
import {
  forgotAdminPasswordSchema,
  loginAdminSchema,
  resetAdminPasswordSchema,
  signupAdminSchema,
} from "../schemas/admin.schema.js";

const router = express.Router();

// Gated: not publicly reachable — see requireInviteToken. Use
// scripts/seedAdmin.js to create the first admin account.
router.post(
  "/signup",
  authLimiter,
  requireInviteToken,
  validate(signupAdminSchema),
  signupAdmin,
);
router.post("/login", authLimiter, validate(loginAdminSchema), loginAdmin);
router.post(
  "/forgot-password",
  authLimiter,
  validate(forgotAdminPasswordSchema),
  forgotAdminPassword,
);
router.post(
  "/reset-password",
  authLimiter,
  validate(resetAdminPasswordSchema),
  resetAdminPassword,
);
export default router;
