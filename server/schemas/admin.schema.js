import { z } from "zod";
import { email, password } from "./common.js";

export const signupAdminSchema = z.object({
  email,
  password,
});

export const loginAdminSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const forgotAdminPasswordSchema = z.object({
  email,
});

export const resetAdminPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password,
});
