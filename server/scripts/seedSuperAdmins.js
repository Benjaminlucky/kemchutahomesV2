// One-time bootstrap for the two initial superadmins. Idempotent — safe to
// re-run; existing accounts are left untouched and reported as SKIP/WARN.
//
// Usage:
//   node scripts/seedSuperAdmins.js
//
// Requires MONGODB_URI and RESEND_API_KEY (server/.env) to be set, same as
// the main app — RESEND_API_KEY missing just means the invite emails don't
// send (sendAdminInviteEmail no-ops and reports it, see utils/email.js).

import "../config/env.js";
import mongoose from "mongoose";
import crypto from "crypto";
import Admin from "../models/admin.js";
import { issueAdminSetupToken } from "../utils/adminInvite.js";
import { sendAdminInviteEmail } from "../utils/email.js";

const SUPERADMINS = [
  { email: "ikem@kemchutahomesltd.com", firstName: "Ikem", lastName: "" },
  { email: "bamidelebenjamin5@gmail.com", firstName: "Bamidele", lastName: "Benjamin" },
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const target of SUPERADMINS) {
    const existing = await Admin.findOne({ email: target.email });

    if (existing) {
      if (existing.role === "superadmin") {
        console.log(`SKIP  ${target.email} — already a superadmin.`);
      } else {
        console.log(
          `WARN  ${target.email} exists with role "${existing.role}" — not modified. Promote manually via the admin panel if intended.`,
        );
      }
      continue;
    }

    const admin = await Admin.create({
      email: target.email,
      firstName: target.firstName,
      lastName: target.lastName,
      role: "superadmin",
      status: "pending",
      // Disposable — never revealed; the real password is set via the
      // account-setup link below.
      password: crypto.randomBytes(32).toString("hex"),
    });

    const setupUrl = await issueAdminSetupToken(admin, 7);
    const result = await sendAdminInviteEmail({
      email: admin.email,
      firstName: admin.firstName,
      setupUrl,
      invitedByEmail: "system (seed script)",
    });

    console.log(
      `CREATE ${target.email} (${admin._id}) — invite email: ${
        result.success ? "sent ✅" : `FAILED (${result.error || result.reason})`
      }`,
    );
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
