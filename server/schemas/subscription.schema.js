import { z } from "zod";
import { email, objectId } from "./common.js";

export const createSubscriptionSchema = z.object({
  estateName: z.string().trim().min(1, "Estate name is required"),
  estateId: objectId.optional(),
  realtorId: objectId.optional(),

  title: z.string().trim().min(1, "Title is required"),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  maritalStatus: z.string().trim().min(1, "Marital status is required"),
  dateOfBirth: z.coerce.date({ error: "Valid date of birth is required" }),
  gender: z.string().trim().min(1, "Gender is required"),
  spouseFirstName: z.string().trim().optional(),
  spouseLastName: z.string().trim().optional(),
  nationality: z.string().trim().optional(),
  employerName: z.string().trim().optional(),

  residentialAddress: z
    .string()
    .trim()
    .min(1, "Residential address is required"),
  cityTown: z.string().trim().min(1, "City/town is required"),
  lga: z.string().trim().min(1, "LGA is required"),
  state: z.string().trim().min(1, "State is required"),
  countryOfResidence: z.string().trim().optional(),
  phone: z.string().trim().min(1, "Phone is required"),
  email,

  plotType: z.enum(["Residential", "Commercial", "Investment"]),
  paymentPlan: z.enum(["Outright", "Instalment"]),
  instalmentMonths: z.coerce.number().int().min(1).max(6).optional(),
  numberOfPlots: z.coerce.number().int().min(1, "At least 1 plot is required"),
  plotSize: z.enum(["500sqm", "300sqm", "Corner Piece"]),
  surveyType: z.string().trim().min(1, "Survey type is required"),
  totalAmount: z.coerce.number().positive("Total amount must be greater than 0"),

  kinFirstName: z.string().trim().min(1, "Next of kin first name is required"),
  kinLastName: z.string().trim().min(1, "Next of kin last name is required"),
  kinAddress: z.string().trim().min(1, "Next of kin address is required"),
  kinCity: z.string().trim().optional(),
  kinLga: z.string().trim().optional(),
  kinPhone: z.string().trim().min(1, "Next of kin phone is required"),
});

export const updateSubscriptionStatusSchema = z.object({
  // Checked against the live STATUSES export in the controller rather than
  // duplicated here as a zod enum, so the two lists can't drift apart.
  status: z.string().min(1, "Status is required"),
});

export const addSubscriptionNoteSchema = z.object({
  content: z.string().trim().min(1, "Note content is required"),
  type: z.enum(["call", "email", "chat", "note"]).optional(),
});

export const recordSubscriptionPaymentSchema = z.object({
  amount: z.coerce.number().positive("Valid amount required"),
  method: z.string().trim().optional(),
  reference: z.string().trim().optional(),
  note: z.string().trim().optional(),
  paidAt: z.coerce.date().optional(),
});

export const allocatePlotSchema = z.object({
  plotNumber: z.string().trim().min(1, "Plot number is required"),
  titleDocument: z.string().trim().optional(),
  plotDescription: z.string().trim().optional(),
});
