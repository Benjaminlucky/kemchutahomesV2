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

// Admin-controlled URL fields (map links, social links) get rendered as raw
// hrefs/iframe src on the public site — restrict to http(s) so a compromised
// admin session can't plant a "javascript:" URI that executes in a visitor's
// browser when clicked.
export const safeUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https:\/\//i.test(v), {
    message: "Must be a valid https:// URL",
  });

// Query-string pagination — validated for shape only (see middlewares/validate.js
// for why this is never written back to req.query).
export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().max(100).optional(),
});
