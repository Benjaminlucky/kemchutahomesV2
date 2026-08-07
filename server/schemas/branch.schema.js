import { z } from "zod";
import { safeUrl } from "./common.js";

const hoursSchema = z.object({
  weekdays: z.string().trim().optional(),
  saturday: z.string().trim().optional(),
  sunday: z.string().trim().optional(),
});

const socialSchema = z.object({
  instagram: safeUrl.optional(),
  facebook: safeUrl.optional(),
  twitter: safeUrl.optional(),
  whatsapp: safeUrl.optional(),
  youtube: safeUrl.optional(),
});

// Lowercased by the controller before use — accept upper/lowercase here but
// keep it a URL/identifier-safe slug (no spaces or punctuation that would
// break admin routes or duplicate a branch via whitespace variants).
const branchIdSchema = z
  .string()
  .trim()
  .min(1, "Branch ID is required")
  .regex(/^[a-zA-Z0-9-]+$/, "Branch ID can only contain letters, numbers, and hyphens");

export const createBranchSchema = z.object({
  branchId: branchIdSchema,
  label: z.string().trim().min(1, "Label is required"),
  address: z.string().trim().optional(),
  phones: z.array(z.string().trim()).optional(),
  emails: z.array(z.string().trim().email("Invalid email address")).optional(),
  mapEmbedUrl: safeUrl.optional(),
  mapLink: safeUrl.optional(),
  hours: hoursSchema.optional(),
  social: socialSchema.optional(),
});

export const updateBranchSchema = z.object({
  label: z.string().trim().min(1).optional(),
  address: z.string().trim().optional(),
  mapEmbedUrl: safeUrl.optional(),
  mapLink: safeUrl.optional(),
  phones: z.array(z.string().trim()).optional(),
  emails: z.array(z.string().trim().email("Invalid email address")).optional(),
  hours: hoursSchema.optional(),
  social: socialSchema.optional(),
  isActive: z.coerce.boolean().optional(),
});
