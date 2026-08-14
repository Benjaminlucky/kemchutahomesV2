import { z } from "zod";
import { email, password, nonEmptyString } from "./common.js";
import { ADMIN_PERMISSION_KEYS } from "../config/permissions.js";

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

/* ─────────────────────── ADMIN MANAGEMENT (RBAC) ──────────────────────── */

const permissionsField = z.array(z.enum(ADMIN_PERMISSION_KEYS)).default([]);

export const inviteAdminSchema = z.object({
  email,
  firstName: nonEmptyString,
  lastName: nonEmptyString,
  role: z.enum(["admin", "superadmin"]).default("admin"),
  permissions: permissionsField,
});

export const updateAdminSchema = z
  .object({
    firstName: nonEmptyString.optional(),
    lastName: nonEmptyString.optional(),
    role: z.enum(["admin", "superadmin"]).optional(),
    permissions: z.array(z.enum(ADMIN_PERMISSION_KEYS)).optional(),
    status: z.enum(["pending", "active", "suspended"]).optional(),
  })
  .strict();

export const completeAdminSetupSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password,
});
