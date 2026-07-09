import express from "express";
import {
  signup,
  login,
  updateAvatar,
  getRealtors,
  getRealtorById,
  updateRealtor,
  deleteRealtor,
  getDashboard,
  getMyRecruits,
  forgotPassword,
  resetPassword, // ✅ Import the new controller
} from "../controllers/realtor.controller.js";

import { uploadSingleImage } from "../middlewares/upload.middleware.js";
import { protect, protectAdmin } from "../middlewares/authMiddleware.js";
import { authLimiter } from "../middlewares/rateLimiters.js";
import { validate } from "../middlewares/validate.js";
import {
  realtorSignupSchema,
  realtorLoginSchema,
  realtorForgotPasswordSchema,
  realtorResetPasswordSchema,
  updateRealtorSchema,
} from "../schemas/realtor.schema.js";

const router = express.Router();

// ✅ Public routes
router.post("/signup", authLimiter, validate(realtorSignupSchema), signup);
router.post("/login", authLimiter, validate(realtorLoginSchema), login);

// ✅ IMPORTANT: Specific routes BEFORE parameterized routes
router.get("/dashboard", protect, getDashboard);
router.get("/my-recruits", protect, getMyRecruits); // ✅ New route for getting recruits
router.put("/avatar", protect, uploadSingleImage, updateAvatar);
router.post(
  "/forgot-password",
  authLimiter,
  validate(realtorForgotPasswordSchema),
  forgotPassword,
);
router.post(
  "/reset-password",
  authLimiter,
  validate(realtorResetPasswordSchema),
  resetPassword,
);

// ✅ Admin routes (parameterized routes LAST)
router.get("/", protectAdmin, getRealtors);
router.get("/:id", protectAdmin, getRealtorById);
router.put("/:id", protectAdmin, validate(updateRealtorSchema), updateRealtor);
router.delete("/:id", protectAdmin, deleteRealtor);

export default router;
