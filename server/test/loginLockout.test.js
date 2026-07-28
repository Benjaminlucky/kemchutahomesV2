/**
 * Tests for the per-account brute-force lockout (PRD §3.5) — both the
 * shared utility in isolation and its real integration into loginAdmin,
 * since a unit test of the utility alone wouldn't catch a wiring mistake
 * (wrong field name, forgotten await, wrong status code) in the controller.
 */
import { describe, expect, it } from "vitest";
import "./setup.js";
import Admin from "../models/admin.js";
import { loginAdmin } from "../controllers/adminController.js";
import { getLockoutStatus, recordFailedLogin, recordSuccessfulLogin } from "../utils/loginLockout.js";
import { mockReq, mockRes } from "./mockExpress.js";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-for-vitest";

async function makeAdmin(overrides = {}) {
  return Admin.create({
    email: `admin-${Date.now()}-${Math.random()}@example.com`,
    password: "correct-horse-battery-staple",
    ...overrides,
  });
}

describe("loginLockout utility", () => {
  it("is not locked for a fresh account", async () => {
    const admin = await makeAdmin();
    expect(getLockoutStatus(admin).locked).toBe(false);
  });

  it("locks after the 5th consecutive failed attempt and reports minutes remaining", async () => {
    const admin = await makeAdmin();
    for (let i = 0; i < 5; i++) await recordFailedLogin(admin);

    const status = getLockoutStatus(admin);
    expect(status.locked).toBe(true);
    expect(status.minutesLeft).toBeGreaterThan(0);
    expect(status.minutesLeft).toBeLessThanOrEqual(15);
  });

  it("does not lock before the 5th failed attempt", async () => {
    const admin = await makeAdmin();
    for (let i = 0; i < 4; i++) await recordFailedLogin(admin);
    expect(getLockoutStatus(admin).locked).toBe(false);
  });

  it("clears attempts and any lock on a successful login", async () => {
    const admin = await makeAdmin();
    for (let i = 0; i < 5; i++) await recordFailedLogin(admin);
    expect(getLockoutStatus(admin).locked).toBe(true);

    await recordSuccessfulLogin(admin);
    expect(getLockoutStatus(admin).locked).toBe(false);
    expect(admin.loginAttempts).toBe(0);
    expect(admin.lockUntil).toBeNull();
  });
});

describe("loginAdmin — brute-force lockout integration", () => {
  it("locks the account after 5 wrong-password attempts, rejecting even a correct one on the 6th", async () => {
    const admin = await makeAdmin({ email: "locktest@example.com" });

    for (let i = 0; i < 5; i++) {
      const req = mockReq({ method: "POST", body: { email: admin.email, password: "wrong-password" } });
      const res = mockRes();
      await loginAdmin(req, res);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid credentials");
    }

    // 6th attempt — correct password, but the account is now locked.
    const req = mockReq({ method: "POST", body: { email: admin.email, password: "correct-horse-battery-staple" } });
    const res = mockRes();
    await loginAdmin(req, res);

    expect(res.statusCode).toBe(423);
    expect(res.body.message).toMatch(/too many failed attempts/i);
  });

  it("a successful login before the threshold resets the counter instead of accumulating across sessions", async () => {
    const admin = await makeAdmin({ email: "resettest@example.com" });

    for (let i = 0; i < 3; i++) {
      const req = mockReq({ method: "POST", body: { email: admin.email, password: "wrong" } });
      await loginAdmin(req, mockRes());
    }

    const goodReq = mockReq({
      method: "POST",
      body: { email: admin.email, password: "correct-horse-battery-staple" },
    });
    const goodRes = mockRes();
    await loginAdmin(goodReq, goodRes);
    expect(goodRes.statusCode).toBe(200);

    const reloaded = await Admin.findOne({ email: admin.email });
    expect(reloaded.loginAttempts).toBe(0);
    expect(reloaded.lockUntil).toBeNull();
  });
});
