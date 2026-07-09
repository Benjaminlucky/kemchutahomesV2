import express from "express";
import { getAnalytics } from "../controllers/analytics.controller.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/admin/analytics — admin only
router.get("/analytics", protectAdmin, getAnalytics);

export default router;
