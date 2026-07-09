import { z } from "zod";

const hoursSchema = z.object({
  weekdays: z.string().trim().optional(),
  saturday: z.string().trim().optional(),
  sunday: z.string().trim().optional(),
});

const socialSchema = z.object({
  instagram: z.string().trim().optional(),
  facebook: z.string().trim().optional(),
  twitter: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  youtube: z.string().trim().optional(),
});

export const createBranchSchema = z.object({
  branchId: z.string().trim().min(1, "Branch ID is required"),
  label: z.string().trim().min(1, "Label is required"),
  address: z.string().trim().optional(),
  phones: z.array(z.string().trim()).optional(),
  emails: z.array(z.string().trim()).optional(),
  mapEmbedUrl: z.string().trim().optional(),
  mapLink: z.string().trim().optional(),
  hours: hoursSchema.optional(),
  social: socialSchema.optional(),
});

export const updateBranchSchema = z.object({
  label: z.string().trim().min(1).optional(),
  address: z.string().trim().optional(),
  mapEmbedUrl: z.string().trim().optional(),
  mapLink: z.string().trim().optional(),
  phones: z.array(z.string().trim()).optional(),
  emails: z.array(z.string().trim()).optional(),
  hours: hoursSchema.optional(),
  social: socialSchema.optional(),
  isActive: z.coerce.boolean().optional(),
});
