import { z } from "zod";
import { email } from "./common.js";

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
  lagosPhone: z.string().trim().max(30).optional(),
  asabaPhone: z.string().trim().max(30).optional(),
  whatsappNumber: z.string().trim().max(30).optional(),
  email: z.union([email, z.literal("")]).optional(),
  lagosAddress: z.string().trim().max(300).optional(),
  asabaAddress: z.string().trim().max(300).optional(),
  workingHours: z.string().trim().max(200).optional(),
  instagramHandle: z.string().trim().max(60).optional(),
});

// FAQ answers and notice text are injected verbatim into the AI's system
// prompt on every single chat request (no truncation downstream) — these
// caps exist to bound that prompt's size, not just for tidy admin UI.
export const addFaqSchema = z.object({
  question: z.string().trim().min(1, "Question is required").max(300, "Question is too long"),
  answer: z.string().trim().min(1, "Answer is required").max(2000, "Answer is too long"),
  category: z.enum(FAQ_CATEGORIES).optional(),
});

export const updateFaqSchema = z.object({
  question: z.string().trim().min(1).max(300, "Question is too long").optional(),
  answer: z.string().trim().min(1).max(2000, "Answer is too long").optional(),
  category: z.enum(FAQ_CATEGORIES).optional(),
  active: z.coerce.boolean().optional(),
});

export const addNoticeSchema = z.object({
  text: z.string().trim().min(1, "Notice text is required").max(300, "Notice text is too long"),
});

export const updateNoticeSchema = z.object({
  text: z.string().trim().min(1).max(300, "Notice text is too long").optional(),
  active: z.coerce.boolean().optional(),
});
