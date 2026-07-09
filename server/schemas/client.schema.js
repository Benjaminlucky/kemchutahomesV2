import { z } from "zod";
import { email, password } from "./common.js";

export const registerClientSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email,
  phone: z.string().trim().optional(),
  password,
});

export const loginClientSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const clientForgotPasswordSchema = z.object({
  email,
});

export const clientResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password,
});

export const checkEmailQuerySchema = z.object({
  email: z.string().trim().min(1, "Email is required"),
});
