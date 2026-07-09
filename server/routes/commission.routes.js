import express from "express";
import {
  getAllCommissions,
  getMyCommissions,
  markCommissionPaid,
  payCommissionBatch,
  getCommissionTiers,
  updateCommissionTiers,
} from "../controllers/commission.controller.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  markCommissionPaidSchema,
  payCommissionBatchSchema,
  updateCommissionTiersSchema,
} from "../schemas/commission.schema.js";

const router = express.Router();

// ── Tier settings (admin) ─────────────────────────────────────────────────────
router.get("/tiers", protect, isAdmin, getCommissionTiers); // GET  /api/commissions/tiers
router.put(
  "/tiers",
  protect,
  isAdmin,
  validate(updateCommissionTiersSchema),
  updateCommissionTiers,
); // PUT  /api/commissions/tiers

// ── Realtor: their own commissions ───────────────────────────────────────────
router.get("/my", protect, getMyCommissions); // GET  /api/commissions/my

// ── Admin: all commissions ───────────────────────────────────────────────────
router.get("/", protect, isAdmin, getAllCommissions); // GET  /api/commissions
router.patch(
  "/:id/pay",
  protect,
  isAdmin,
  validate(markCommissionPaidSchema),
  markCommissionPaid,
); // PATCH /api/commissions/:id/pay
router.post(
  "/pay-batch",
  protect,
  isAdmin,
  validate(payCommissionBatchSchema),
  payCommissionBatch,
); // POST  /api/commissions/pay-batch

export default router;
