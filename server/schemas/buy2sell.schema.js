import { z } from "zod";
import { email } from "./common.js";

export const updateROISettingsSchema = z.object({
  roiPercent6Months: z.coerce.number().min(0).optional(),
  roiPercent12Months: z.coerce.number().min(0).optional(),
  roiPercent18Months: z.coerce.number().min(0).optional(),
  minInvestment: z.coerce.number().min(0).optional(),
  maxInvestment: z.coerce.number().min(0).optional(),
  description: z.string().trim().optional(),
});

export const submitBuy2SellLeadSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  email,
  phone: z.string().trim().min(1, "Phone is required"),
  duration: z.enum(["6 Months", "12 Months", "18 Months"]),
  principalAmount: z.coerce.number().positive("Investment amount is required"),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.string().trim().optional(),
  nationality: z.string().trim().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  idType: z.string().trim().optional(),
  idNumber: z.string().trim().optional(),
  idDocumentUrl: z.string().trim().optional(),
});

export const recordB2SPaymentSchema = z.object({
  amount: z.coerce.number().positive("Valid amount required"),
  method: z.string().trim().optional(),
  reference: z.string().trim().optional(),
  note: z.string().trim().optional(),
  paidAt: z.coerce.date().optional(),
});

export const processPayoutSchema = z.object({
  actualPayout: z.coerce.number().positive().optional(),
  payoutReference: z.string().trim().optional(),
  method: z.string().trim().optional(),
});

export const updateLeadStatusSchema = z.object({
  // Checked against the live B2S_STATUSES export in the controller.
  status: z.string().optional(),
  notes: z.string().trim().optional(),
});
