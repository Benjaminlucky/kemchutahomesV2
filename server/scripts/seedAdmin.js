// One-time admin creation, run from the command line — replaces the old
// publicly-reachable POST /api/admin/signup endpoint.
//
// Usage:
//   ADMIN_SEED_EMAIL=you@example.com ADMIN_SEED_PASSWORD='...' node scripts/seedAdmin.js
//
// Requires MONGODB_URI (and the rest of server/.env) to be set, same as the
// main app. Refuses to run if an admin with that email already exists.

import "../config/env.js";
import mongoose from "mongoose";
import Admin from "../models/admin.js";

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    console.error(
      "Set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD env vars before running this script.",
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("ADMIN_SEED_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.error(`An admin with email ${email} already exists. Aborting.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const admin = await Admin.create({ email, password });
  console.log(`Admin created: ${admin.email} (${admin._id})`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
