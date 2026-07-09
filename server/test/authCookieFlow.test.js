/**
 * Characterization tests for the Phase 5 cookie-auth flow end to end:
 * protect()/protectClient() accepting the access_token cookie as an
 * alternative to the Bearer header, CSRF enforcement on that path, and the
 * /api/auth/refresh + /api/auth/logout controllers. See also
 * authTokens.test.js for the lower-level rotation/revocation logic.
 */
import { describe, expect, it } from "vitest";
import mongoose from "mongoose";
import "./setup.js";
import Admin from "../models/admin.js";

const newId = () => new mongoose.Types.ObjectId();
import RefreshToken from "../models/RefreshToken.model.js";
import { protect, protectClient } from "../middlewares/authMiddleware.js";
import { refresh, logout, me } from "../controllers/auth.controller.js";
import {
  signAccessToken,
  issueRefreshToken,
  hashToken,
} from "../utils/authTokens.js";
import { mockReq, mockRes } from "./mockExpress.js";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-for-vitest";

async function makeAdmin() {
  return Admin.create({ email: `admin-${Date.now()}@example.com`, password: "irrelevant-for-these-tests" });
}

function callNext() {
  let called = false;
  const next = (err) => {
    called = true;
    next.err = err;
  };
  next.wasCalled = () => called;
  return next;
}

describe("protect() — cookie credential", () => {
  it("authenticates via access_token cookie on a safe (GET) method with no CSRF header needed", async () => {
    const admin = await makeAdmin();
    const accessToken = signAccessToken({ id: admin._id, role: "admin" });
    const req = mockReq({ method: "GET", cookies: { access_token: accessToken } });
    const res = mockRes();
    const next = callNext();

    await protect(req, res, next);

    expect(next.wasCalled()).toBe(true);
    expect(req.user.role).toBe("admin");
  });

  it("rejects a state-changing request authenticated via cookie without a matching CSRF header", async () => {
    const admin = await makeAdmin();
    const accessToken = signAccessToken({ id: admin._id, role: "admin" });
    const req = mockReq({
      method: "POST",
      cookies: { access_token: accessToken, csrf_token: "the-real-csrf-value" },
      headers: {}, // no x-csrf-token header at all
    });
    const res = mockRes();
    const next = callNext();

    await protect(req, res, next);

    expect(next.wasCalled()).toBe(false);
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/CSRF/i);
  });

  it("accepts a state-changing cookie-authenticated request when the CSRF header matches the cookie", async () => {
    const admin = await makeAdmin();
    const accessToken = signAccessToken({ id: admin._id, role: "admin" });
    const req = mockReq({
      method: "POST",
      cookies: { access_token: accessToken, csrf_token: "matching-value" },
      headers: { "x-csrf-token": "matching-value" },
    });
    const res = mockRes();
    const next = callNext();

    await protect(req, res, next);

    expect(next.wasCalled()).toBe(true);
    expect(req.user.role).toBe("admin");
  });

  it("prefers the Bearer header over any cookie present, and never CSRF-checks Bearer auth", async () => {
    const admin = await makeAdmin();
    const accessToken = signAccessToken({ id: admin._id, role: "admin" });
    const req = mockReq({
      method: "POST", // state-changing, but via Bearer — CSRF check must not apply
      headers: { authorization: `Bearer ${accessToken}` },
      cookies: { access_token: "garbage-cookie-value", csrf_token: "x" }, // no matching header — would fail if checked
    });
    const res = mockRes();
    const next = callNext();

    await protect(req, res, next);

    expect(next.wasCalled()).toBe(true);
    expect(res.statusCode).toBe(200); // untouched — no CSRF rejection happened
  });
});

describe("protectClient() — cookie credential", () => {
  it("applies the same CSRF rule as protect() for the client principal", async () => {
    const accessToken = signAccessToken({ id: "some-client-id", role: "client" });
    const req = mockReq({
      method: "PATCH",
      cookies: { access_token: accessToken, csrf_token: "abc" },
      headers: {}, // missing x-csrf-token
    });
    const res = mockRes();
    const next = callNext();

    await protectClient(req, res, next);

    expect(next.wasCalled()).toBe(false);
    expect(res.statusCode).toBe(403);
  });
});

describe("POST /api/auth/refresh", () => {
  it("rejects when there is no refresh_token cookie", async () => {
    const req = mockReq({ cookies: {} });
    const res = mockRes();

    await refresh(req, res);

    expect(res.statusCode).toBe(401);
  });

  it("rotates a valid refresh token and sets new cookies", async () => {
    const rawToken = await issueRefreshToken("admin", newId());
    const req = mockReq({ cookies: { refresh_token: rawToken } });
    const res = mockRes();

    await refresh(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.cookies.access_token).toBeTruthy();
    expect(res.cookies.refresh_token).toBeTruthy();
    expect(res.cookies.refresh_token.value).not.toBe(rawToken);
  });

  it("rejects a second refresh attempt with the same (now-rotated) token", async () => {
    const rawToken = await issueRefreshToken("client", newId());
    await refresh(mockReq({ cookies: { refresh_token: rawToken } }), mockRes());

    const secondRes = mockRes();
    await refresh(mockReq({ cookies: { refresh_token: rawToken } }), secondRes);

    expect(secondRes.statusCode).toBe(401);
  });
});

describe("POST /api/auth/logout", () => {
  it("revokes the refresh token and clears all three auth cookies", async () => {
    const rawToken = await issueRefreshToken("realtor", newId());
    const req = mockReq({ cookies: { refresh_token: rawToken } });
    const res = mockRes();

    await logout(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.clearedCookies).toEqual(
      expect.arrayContaining(["access_token", "refresh_token", "csrf_token"]),
    );

    const record = await RefreshToken.findOne({ tokenHash: hashToken(rawToken) });
    expect(record.revokedAt).toBeTruthy();
  });

  it("succeeds even with no refresh cookie present (idempotent)", async () => {
    const req = mockReq({ cookies: {} });
    const res = mockRes();

    await logout(req, res);

    expect(res.statusCode).toBe(200);
  });
});

describe("GET /api/auth/me", () => {
  it("resolves an Admin principal correctly (protect() + me() chained, as the real route does)", async () => {
    const admin = await makeAdmin();
    const accessToken = signAccessToken({ id: admin._id, role: "admin" });
    const req = mockReq({ method: "GET", cookies: { access_token: accessToken } });
    const res = mockRes();

    await protect(req, res, () => me(req, res));

    expect(res.statusCode).toBe(200);
    expect(res.body.role).toBe("admin");
    expect(res.body.email).toBe(admin.email);
  });
});
