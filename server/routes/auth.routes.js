import express from "express";
import { refresh, logout, me } from "../controllers/auth.controller.js";
import { authLimiter } from "../middlewares/rateLimiters.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, me);
router.post("/refresh", authLimiter, refresh);
router.post("/logout", logout);

export default router;
