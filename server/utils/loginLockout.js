/**
 * utils/loginLockout.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Per-account brute-force lockout, shared across all three login principals
 * (Admin, Realtor, Client) — PRD §3.5: "No brute-force protection — login
 * endpoints for all three principals accept unlimited attempts; no lockout,
 * delay, or CAPTCHA." This is a second, complementary layer on top of the
 * existing IP-based authLimiter (rateLimiters.js): that limiter throttles by
 * IP regardless of which account is being tried, so a distributed attacker
 * (many IPs, one target account) sails through it — this closes that gap by
 * tracking failures per account instead.
 *
 * Expects the calling model to have `loginAttempts` (Number) and `lockUntil`
 * (Date | null) fields — see admin.js / realtor.model.js / client.model.js.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

/** Returns whether `doc` is currently locked out, and if so, how many minutes remain. */
export function getLockoutStatus(doc) {
  if (doc.lockUntil && doc.lockUntil > new Date()) {
    return { locked: true, minutesLeft: Math.ceil((doc.lockUntil - Date.now()) / 60_000) };
  }
  return { locked: false, minutesLeft: 0 };
}

/**
 * Records a failed password attempt. On the Nth consecutive failure, sets a
 * time-boxed lock (not permanent — resets itself after LOCKOUT_MS) rather
 * than requiring manual admin intervention to unlock an account.
 */
export async function recordFailedLogin(doc) {
  doc.loginAttempts = (doc.loginAttempts || 0) + 1;
  if (doc.loginAttempts >= MAX_ATTEMPTS) {
    doc.lockUntil = new Date(Date.now() + LOCKOUT_MS);
    doc.loginAttempts = 0;
  }
  await doc.save({ validateBeforeSave: false });
}

/** Clears any accumulated failures/lock on a successful login. */
export async function recordSuccessfulLogin(doc) {
  if (doc.loginAttempts || doc.lockUntil) {
    doc.loginAttempts = 0;
    doc.lockUntil = null;
    await doc.save({ validateBeforeSave: false });
  }
}
