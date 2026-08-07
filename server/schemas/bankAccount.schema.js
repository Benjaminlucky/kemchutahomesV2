import { z } from "zod";

// Digits only (no letters/symbols) so a typo can't silently become part of a
// real customer's wire-transfer instructions. Length is a loose 8-20 range
// rather than a hard 10-digit NUBAN rule — the optional sortCode field hints
// non-Nigerian accounts were meant to be supported too.
const accountNumber = z
  .string()
  .trim()
  .min(8, "Account number must be at least 8 digits")
  .max(20, "Account number is too long")
  .regex(/^\d+$/, "Account number must contain digits only");

const sortCode = z
  .string()
  .trim()
  .regex(/^[\d-]*$/, "Sort code must contain only digits and hyphens")
  .optional();

export const createBankAccountSchema = z.object({
  bankName: z.string().trim().min(1, "Bank name is required"),
  accountName: z.string().trim().min(1, "Account name is required"),
  accountNumber,
  sortCode,
  note: z.string().trim().optional(),
  isPrimary: z.coerce.boolean().optional(),
});

export const updateBankAccountSchema = z.object({
  bankName: z.string().trim().min(1).optional(),
  accountName: z.string().trim().min(1).optional(),
  accountNumber: accountNumber.optional(),
  sortCode,
  note: z.string().trim().optional(),
  isActive: z.coerce.boolean().optional(),
  isPrimary: z.coerce.boolean().optional(),
});
