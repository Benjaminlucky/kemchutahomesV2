/**
 * schemas/common.js — shared zod primitives reused across resource schemas.
 */
import { z } from "zod";

export const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

export const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email address");

export const password = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const nonEmptyString = z.string().trim().min(1, "Required");

// Query-string pagination — validated for shape only (see middlewares/validate.js
// for why this is never written back to req.query).
export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().max(100).optional(),
});
