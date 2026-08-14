import crypto from "crypto";

// Shared by inviteAdmin, resendInviteAdmin, and scripts/seedSuperAdmins.js —
// mirrors the resetAdminPassword token pattern (hash-at-rest, raw token only
// ever in the emailed URL) but with a longer expiry suited to a first-time
// account invite rather than a password reset.
export async function issueAdminSetupToken(adminDoc, days = 7) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  adminDoc.resetPasswordToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  adminDoc.resetPasswordExpiry = Date.now() + days * 24 * 60 * 60 * 1000;
  await adminDoc.save({ validateBeforeSave: false });

  const FRONTEND_URL = process.env.FRONTEND_URL || "https://kemchutahomesltd.com";
  return `${FRONTEND_URL}/admin/setup-account?token=${rawToken}`;
}
