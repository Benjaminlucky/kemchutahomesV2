import express from "express";
import {
  getAllCommissions,
  getMyCommissions,
  markCommissionPaid,
  clawbackCommission,
  payCommissionBatch,
  getCommissionTiers,
  updateCommissionTiers,
} from "../controllers/commission.controller.js";
import { protect, isAdmin, hasPermission } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  markCommissionPaidSchema,
  clawbackCommissionSchema,
  payCommissionBatchSchema,
  updateCommissionTiersSchema,
  commissionQuerySchema,
} from "../schemas/commission.schema.js";

const router = express.Router();

// ── Tier settings ─────────────────────────────────────────────────────────────
// GET is read-only and open to any authenticated principal (admin or realtor)
// — a realtor's own earnings page needs the live rates so its "you earn X%"
// copy can't drift from what an admin has actually configured. PUT stays
// admin-only.
router.get("/tiers", protect, getCommissionTiers); // GET  /api/commissions/tiers
router.put(
  "/tiers",
  protect,
  isAdmin,
  hasPermission("commissions"),
  validate(updateCommissionTiersSchema),
  updateCommissionTiers,
); // PUT  /api/commissions/tiers

// ── Realtor: their own commissions ───────────────────────────────────────────
router.get("/my", protect, getMyCommissions); // GET  /api/commissions/my

// ── Admin: all commissions ───────────────────────────────────────────────────
router.get(
  "/",
  protect,
  isAdmin,
  hasPermission("commissions"),
  validate(commissionQuerySchema, "query"),
  getAllCommissions,
); // GET  /api/commissions
router.patch(
  "/:id/pay",
  protect,
  isAdmin,
  hasPermission("commissions"),
  validate(markCommissionPaidSchema),
  markCommissionPaid,
); // PATCH /api/commissions/:id/pay
router.patch(
  "/:id/clawback",
  protect,
  isAdmin,
  hasPermission("commissions"),
  validate(clawbackCommissionSchema),
  clawbackCommission,
); // PATCH /api/commissions/:id/clawback
router.post(
  "/pay-batch",
  protect,
  isAdmin,
  hasPermission("commissions"),
  validate(payCommissionBatchSchema),
  payCommissionBatch,
); // POST  /api/commissions/pay-batch

export default router;
