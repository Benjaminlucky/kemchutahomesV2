// One-time migration for the Admin accounts that existed before RBAC
// (role/permissions/status) was added to the schema. Without this, every
// pre-existing admin defaults to permissions:[] the moment hasPermission()
// gating goes live on the resource routes, silently locking them out of
// every dashboard section.
//
// Decided per-account with the user (2026-08-14):
//   - ikem@kemchutahomesltd.com, bamidelebenjamin5@gmail.com  -> promoted
//     to superadmin (already-working accounts; no setup email, since they
//     don't need a new password).
//   - kemchutahomesltd@gmail.com, ugwuaugustina48@gmail.com,
//     admin@kemchutahomesltd.com                              -> kept as
//     "admin" but granted every permission key, preserving today's
//     full-access behavior.
//   - e2e-admin-1783368521@example.com                        -> deleted
//     (automated-test debris, not a real login).
//
// Safe to re-run: promotions/grants are idempotent, and the delete only
// matches that one exact address.
//
// Usage: node scripts/migrateExistingAdmins.js

import "../config/env.js";
import mongoose from "mongoose";
import Admin from "../models/admin.js";
import { ADMIN_PERMISSION_KEYS } from "../config/permissions.js";

const PROMOTE_TO_SUPERADMIN = ["ikem@kemchutahomesltd.com", "bamidelebenjamin5@gmail.com"];
const GRANT_FULL_PERMISSIONS = [
  "kemchutahomesltd@gmail.com",
  "ugwuaugustina48@gmail.com",
  "admin@kemchutahomesltd.com",
];
const DELETE_EXACT = ["e2e-admin-1783368521@example.com"];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const email of PROMOTE_TO_SUPERADMIN) {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log(`SKIP  ${email} — no such admin (expected to already exist).`);
      continue;
    }
    admin.role = "superadmin";
    admin.status = "active";
    await admin.save({ validateBeforeSave: false });
    console.log(`PROMOTE ${email} -> superadmin`);
  }

  for (const email of GRANT_FULL_PERMISSIONS) {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log(`SKIP  ${email} — no such admin.`);
      continue;
    }
    admin.role = "admin";
    admin.status = "active";
    admin.permissions = ADMIN_PERMISSION_KEYS;
    await admin.save({ validateBeforeSave: false });
    console.log(`GRANT ${email} -> all permissions`);
  }

  for (const email of DELETE_EXACT) {
    const result = await Admin.deleteOne({ email });
    console.log(
      result.deletedCount
        ? `DELETE ${email} — removed.`
        : `SKIP  ${email} — already gone.`,
    );
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
