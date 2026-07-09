import { z } from "zod";
import { email, password } from "./common.js";

export const realtorSignupSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email,
  phone: z.string().trim().min(7, "Valid phone number is required"),
  state: z.string().trim().optional(),
  bank: z.string().trim().optional(),
  accountName: z.string().trim().optional(),
  accountNumber: z.string().trim().optional(),
  password,
  ref: z.string().trim().optional(),
  birthDate: z.coerce.date({ error: "Valid birth date is required" }),
  avatar: z.string().trim().optional(),
});

export const realtorLoginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const realtorForgotPasswordSchema = z.object({
  email,
});

export const realtorResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password,
});

// Whitelist for PUT /api/realtors/:id (admin). The legacy dashboard spreads
// the full fetched realtor doc into its edit-form state and sends it back
// wholesale, but only ever mutates these fields — everything else (passwordHash,
// referralCode, recruitedBy, _id, ...) must never be mass-assignable here.
export const updateRealtorSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  email: email.optional(),
  phone: z.string().trim().min(7).optional(),
  state: z.string().trim().optional(),
  bank: z.string().trim().optional(),
  accountName: z.string().trim().optional(),
  accountNumber: z.string().trim().optional(),
});
