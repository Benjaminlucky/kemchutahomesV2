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

// Admin — manually log an inspection (e.g. a phone-in booking). Same shape as
// bookInspectionSchema but lets the admin set an initial status instead of
// always defaulting to "pending".
export const createInspectionAdminSchema = z.object({
  estateName: z.string().trim().min(1, "Estate name is required"),
  estateId: objectId.nullable().optional(),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email,
  phone: z.string().trim().min(1, "Phone is required"),
  inspectionDate: z.coerce.date({ error: "Valid inspection date is required" }),
  persons: z.coerce.number().int().min(1, "At least 1 person required"),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
  notes: z.string().trim().optional(),
});

// Admin — full edit (PUT /api/inspections/:id). Whitelist, all optional so a
// partial payload never wipes fields the form didn't touch; validate() still
// strips anything not declared here (e.g. _id, createdAt) even if sent.
export const updateInspectionAdminSchema = z.object({
  estateName: z.string().trim().min(1, "Estate name is required").optional(),
  estateId: objectId.nullable().optional(),
  firstName: z.string().trim().min(1, "First name is required").optional(),
  lastName: z.string().trim().min(1, "Last name is required").optional(),
  email: email.optional(),
  phone: z.string().trim().min(1, "Phone is required").optional(),
  inspectionDate: z.coerce.date({ error: "Valid inspection date is required" }).optional(),
  persons: z.coerce.number().int().min(1, "At least 1 person required").optional(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
  notes: z.string().trim().optional(),
});
