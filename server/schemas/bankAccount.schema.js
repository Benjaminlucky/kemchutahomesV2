import { z } from "zod";

export const createBankAccountSchema = z.object({
  bankName: z.string().trim().min(1, "Bank name is required"),
  accountName: z.string().trim().min(1, "Account name is required"),
  accountNumber: z.string().trim().min(1, "Account number is required"),
  sortCode: z.string().trim().optional(),
  note: z.string().trim().optional(),
  isPrimary: z.coerce.boolean().optional(),
});

export const updateBankAccountSchema = z.object({
  bankName: z.string().trim().min(1).optional(),
  accountName: z.string().trim().min(1).optional(),
  accountNumber: z.string().trim().min(1).optional(),
  sortCode: z.string().trim().optional(),
  note: z.string().trim().optional(),
  isActive: z.coerce.boolean().optional(),
  isPrimary: z.coerce.boolean().optional(),
});
