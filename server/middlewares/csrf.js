/**
 * middlewares/csrf.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Double-submit CSRF check for cookie-authenticated requests (PRD FR-4:
 * "CSRF protection on state-changing routes"). This is a plain function,
 * not route-level middleware — it's called from inside
 * protect()/protectClient() (authMiddleware.js) once they've determined a
 * request was authenticated via the access_token cookie rather than a
 * Bearer header. Bearer-token requests never reach this check: a
 * cross-site page can trigger a browser into sending cookies automatically,
 * but it cannot make the browser attach a custom Authorization header, so
 * Bearer auth is not CSRF-vulnerable to begin with.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function verifyCsrf(req) {
  if (SAFE_METHODS.has(req.method)) return true;

  const csrfCookie = req.cookies?.csrf_token;
  const csrfHeader = req.headers["x-csrf-token"];
  return Boolean(csrfCookie) && csrfCookie === csrfHeader;
}
