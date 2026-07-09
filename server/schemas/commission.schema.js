import { z } from "zod";
import { objectId } from "./common.js";

export const markCommissionPaidSchema = z.object({
  paymentRef: z.string().trim().optional(),
  note: z.string().trim().optional(),
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
