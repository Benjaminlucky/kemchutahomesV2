/**
 * controllers/auth.controller.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Cookie-auth session endpoints (PRD FR-4/§4.3, Phase 5). Shared across all
 * three principals — the refresh token record already knows which one it
 * belongs to (RefreshToken.principalType), so there's one endpoint instead
 * of three.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import {
  rotateRefreshToken,
  revokeRefreshToken,
  signAccessToken,
  setAuthCookies,
  clearAuthCookies,
} from "../utils/authTokens.js";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me
// Generic "who am I" check, behind `protect` (any authenticated Admin or
// Realtor — see authMiddleware.js). Echoes the req.user that protect()
// already resolved. Exists because GET /api/realtors/dashboard only looks
// up the Realtor collection and 404s for an actual Admin principal — the
// Next.js dashboard layout needs a role check that works for either.
// ─────────────────────────────────────────────────────────────────────────────
export const me = (req, res) => {
  res.json(req.user);
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/refresh
// Exchanges a valid refresh_token cookie for a new access_token (+ rotated
// refresh_token). No body required — everything needed travels as cookies.
// ─────────────────────────────────────────────────────────────────────────────
export const refresh = async (req, res) => {
  const rawRefreshToken = req.cookies?.refresh_token;
  if (!rawRefreshToken) {
    return res.status(401).json({ message: "No active session." });
  }

  const rotated = await rotateRefreshToken(rawRefreshToken);
  if (!rotated) {
    clearAuthCookies(res);
    return res
      .status(401)
      .json({ message: "Session expired. Please log in again." });
  }

  const accessToken = signAccessToken({
    id: rotated.principalId,
    role: rotated.principalType,
  });
  setAuthCookies(res, { accessToken, refreshToken: rotated.rawToken });

  res.json({ message: "Session refreshed." });
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// Revokes the refresh token (if any) and clears all auth cookies. Always
// succeeds — logging out of a session that's already gone isn't an error.
// ─────────────────────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
  const rawRefreshToken = req.cookies?.refresh_token;
  if (rawRefreshToken) {
    await revokeRefreshToken(rawRefreshToken);
  }
  clearAuthCookies(res);
  res.json({ message: "Logged out." });
};
