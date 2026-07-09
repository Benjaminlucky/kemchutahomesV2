import { z } from "zod";

const FAQ_CATEGORIES = [
  "General",
  "Subscription",
  "Buy2Sell",
  "Inspection",
  "Documents",
  "Payment",
];

// Whitelist matches the controller's own `allowed` field list exactly.
export const updateCompanyInfoSchema = z.object({
  lagosPhone: z.string().trim().optional(),
  asabaPhone: z.string().trim().optional(),
  whatsappNumber: z.string().trim().optional(),
  email: z.string().trim().optional(),
  lagosAddress: z.string().trim().optional(),
  asabaAddress: z.string().trim().optional(),
  workingHours: z.string().trim().optional(),
  instagramHandle: z.string().trim().optional(),
});

export const addFaqSchema = z.object({
  question: z.string().trim().min(1, "Question is required"),
  answer: z.string().trim().min(1, "Answer is required"),
  category: z.enum(FAQ_CATEGORIES).optional(),
});

export const updateFaqSchema = z.object({
  question: z.string().trim().min(1).optional(),
  answer: z.string().trim().min(1).optional(),
  category: z.enum(FAQ_CATEGORIES).optional(),
  active: z.coerce.boolean().optional(),
});

export const addNoticeSchema = z.object({
  text: z.string().trim().min(1, "Notice text is required"),
});
