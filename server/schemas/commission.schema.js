import { z } from "zod";
import { objectId } from "./common.js";

export const markCommissionPaidSchema = z.object({
  paymentRef: z.string().trim().optional(),
  note: z.string().trim().optional(),
});

export const clawbackCommissionSchema = z.object({
  reason: z.string().trim().min(1, "A reason is required").max(500).optional(),
});

// Query gate for GET /api/commissions (admin). Validated for pass/fail only —
// Express 5 exposes req.query as a getter that can't be reassigned, so the
// controller still does its own coercion after this middleware has rejected
// malformed input (same pattern as estateQuerySchema).
export const commissionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(["pending", "approved", "paid", "clawedback"]).optional(),
  level: z.coerce.number().int().min(1).max(4).optional(),
  realtorId: objectId.optional(),
  sourceType: z.enum(["subscription", "buy2sell"]).optional(),
  search: z.string().max(100).optional(),
});

export const payCommissionBatchSchema = z.object({
  ids: z.array(objectId).min(1, "At least one commission ID is required"),
  paymentRef: z.string().trim().optional(),
});

export const updateCommissionTiersSchema = z.object({
  level1Percent: z.coerce.number().min(0).max(50).optional(),
  level2Percent: z.coerce.number().min(0).max(30).optional(),
  level3Percent: z.coerce.number().min(0).max(20).optional(),
  level4Percent: z.coerce.number().min(0).max(15).optional(),
  whtPercent: z.coerce.number().min(0).max(20).optional(),
  clawbackDays: z.coerce.number().int().min(0).optional(),
});
