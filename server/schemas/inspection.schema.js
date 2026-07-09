import { z } from "zod";
import { email, objectId } from "./common.js";

export const bookInspectionSchema = z.object({
  estateName: z.string().trim().min(1, "Estate name is required"),
  estateId: objectId.optional(),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email,
  phone: z.string().trim().min(1, "Phone is required"),
  inspectionDate: z.coerce.date({ error: "Valid inspection date is required" }),
  persons: z.coerce.number().int().min(1, "At least 1 person required"),
  notes: z.string().trim().optional(),
});

export const updateInspectionStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
});

export const updateInspectionNotesSchema = z.object({
  notes: z.string().trim().optional(),
});
