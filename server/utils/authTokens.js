/**
 * utils/authTokens.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Cookie-auth building blocks for Phase 5 (PRD FR-4/§4.3). This is additive,
 * not a replacement: the existing 7-day (admin/realtor) / 30-day (client)
 * Bearer tokens returned in login response bodies are untouched, so
 * client-legacy keeps working exactly as it does today throughout the
 * transition window described in the PRD's migration strategy (§4.6).
 *
 * What's new here is a *second*, parallel credential — a short-lived access
 * token plus a rotating refresh token, both delivered as httpOnly cookies —
 * for the future Next.js client portal/dashboard to use once built.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import crypto from "crypto";
import jwt from "jsonwebtoken";
import RefreshToken from "../models/RefreshToken.model.js";

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
export const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined; // e.g. ".kemchutahomesltd.com"; unset in dev
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const baseCookieOptions = {
  domain: COOKIE_DOMAIN,
  path: "/",
  sameSite: "lax",
  // Cookies can't be marked Secure over plain http — only require it in
  // production, where the API is always served over TLS.
  secure: IS_PRODUCTION,
};

export function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function signAccessToken({ id, role }) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
  });
}

/**
 * Issues a brand-new refresh token record for a principal (used at login).
 * Returns the raw token — only its hash is persisted.
 */
export async function issueRefreshToken(principalType, principalId) {
  const rawToken = crypto.randomBytes(40).toString("hex");
  await RefreshToken.create({
    tokenHash: hashToken(rawToken),
    principalType,
    principalId,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
  });
  return rawToken;
}

/**
 * Exchanges a valid, unexpired, unrevoked refresh token for a new one
 * (rotation — PRD: "rotating refresh token"). The old record is marked
 * replaced rather than deleted, so a replayed old token is distinguishable
 * from one that was simply never issued.
 *
 * Returns null if the token is invalid/expired/revoked/already-rotated —
 * callers should treat that as "refresh failed, require a fresh login."
 */
export async function rotateRefreshToken(rawToken) {
  const tokenHash = hashToken(rawToken);
  const record = await RefreshToken.findOne({ tokenHash });
  if (!record) return null;
  if (record.revokedAt) return null;
  if (record.replacedByTokenHash) return null; // reuse of an already-rotated token
  if (record.expiresAt <= new Date()) return null;

  const newRawToken = crypto.randomBytes(40).toString("hex");
  const newRecord = await RefreshToken.create({
    tokenHash: hashToken(newRawToken),
    principalType: record.principalType,
    principalId: record.principalId,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
  });
  record.replacedByTokenHash = newRecord.tokenHash;
  await record.save();

  return {
    rawToken: newRawToken,
    principalType: record.principalType,
    principalId: record.principalId,
  };
}

/** Revokes a refresh token (logout) — idempotent, safe to call on an unknown token. */
export async function revokeRefreshToken(rawToken) {
  await RefreshToken.updateOne(
    { tokenHash: hashToken(rawToken) },
    { revokedAt: new Date() },
  );
}

/**
 * Sets the three cookies that make up the cookie-auth credential:
 *   - access_token  (httpOnly) — short-lived JWT, read by protect()/protectClient()
 *   - refresh_token (httpOnly) — opaque, only ever sent to /api/auth/refresh
 *   - csrf_token    (NOT httpOnly) — double-submit CSRF defense (see middlewares/csrf.js);
 *     must be JS-readable so the client can echo it back in a header
 */
export function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie("access_token", accessToken, {
    ...baseCookieOptions,
    httpOnly: true,
    maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
  });
  res.cookie("refresh_token", refreshToken, {
    ...baseCookieOptions,
    httpOnly: true,
    maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
  });
  res.cookie("csrf_token", crypto.randomBytes(24).toString("hex"), {
    ...baseCookieOptions,
    httpOnly: false,
    maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
  });
}

export function clearAuthCookies(res) {
  for (const name of ["access_token", "refresh_token", "csrf_token"]) {
    res.clearCookie(name, baseCookieOptions);
  }
}

/**
 * Issues the full cookie-auth credential for a principal at login — a
 * fresh access token + a fresh refresh token record — and sets all three
 * cookies on the response. Called alongside (never instead of) the
 * existing body-token response.
 */
export async function issueAuthCookies(res, { id, role }) {
  // role is always exactly "admin" | "realtor" | "client" (Admin/Realtor/
  // Client are the only three JWT issuers), which is also RefreshToken's
  // principalType enum — no mapping needed.
  const [accessToken, refreshToken] = await Promise.all([
    Promise.resolve(signAccessToken({ id, role })),
    issueRefreshToken(role, id),
  ]);
  setAuthCookies(res, { accessToken, refreshToken });
}
