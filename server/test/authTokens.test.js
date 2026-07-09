/**
 * Characterization tests for utils/authTokens.js — the Phase 5 cookie-auth
 * building blocks (PRD FR-4). Covers the properties that matter most for a
 * session system: rotation actually rotates, a revoked or already-rotated
 * token can never be exchanged again, and expiry is enforced.
 */
import { describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import "./setup.js";
import RefreshToken from "../models/RefreshToken.model.js";

const newId = () => new mongoose.Types.ObjectId();
import {
  hashToken,
  signAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
} from "../utils/authTokens.js";

const originalJwtSecret = process.env.JWT_SECRET;
process.env.JWT_SECRET = originalJwtSecret || "test-secret-for-vitest";

describe("signAccessToken", () => {
  it("produces a JWT carrying id and role, verifiable with JWT_SECRET", () => {
    const token = signAccessToken({ id: "abc123", role: "admin" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe("abc123");
    expect(decoded.role).toBe("admin");
  });
});

describe("issueRefreshToken", () => {
  it("creates a hashed, non-revoked record with ~30 day expiry and returns the raw token", async () => {
    const clientId = newId();
    const rawToken = await issueRefreshToken("client", clientId);
    expect(typeof rawToken).toBe("string");
    expect(rawToken.length).toBeGreaterThan(20);

    const record = await RefreshToken.findOne({ tokenHash: hashToken(rawToken) });
    expect(record).toBeTruthy();
    expect(record.principalType).toBe("client");
    expect(record.principalId.toString()).toBe(clientId.toString());
    expect(record.revokedAt).toBeNull();
    expect(record.replacedByTokenHash).toBeNull();

    const daysUntilExpiry =
      (record.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    expect(daysUntilExpiry).toBeGreaterThan(29);
    expect(daysUntilExpiry).toBeLessThanOrEqual(30);
  });
});

describe("rotateRefreshToken", () => {
  it("exchanges a valid token for a new one and marks the old one replaced", async () => {
    const adminId = newId();
    const rawToken = await issueRefreshToken("admin", adminId);

    const rotated = await rotateRefreshToken(rawToken);
    expect(rotated).toBeTruthy();
    expect(rotated.principalType).toBe("admin");
    expect(rotated.principalId.toString()).toBe(adminId.toString());
    expect(rotated.rawToken).not.toBe(rawToken);

    const oldRecord = await RefreshToken.findOne({ tokenHash: hashToken(rawToken) });
    expect(oldRecord.replacedByTokenHash).toBe(hashToken(rotated.rawToken));

    const newRecord = await RefreshToken.findOne({
      tokenHash: hashToken(rotated.rawToken),
    });
    expect(newRecord).toBeTruthy();
    expect(newRecord.replacedByTokenHash).toBeNull();
  });

  it("rejects reuse of an already-rotated token (stolen-token replay detection)", async () => {
    const rawToken = await issueRefreshToken("realtor", newId());
    await rotateRefreshToken(rawToken); // first exchange succeeds

    const secondAttempt = await rotateRefreshToken(rawToken); // replay of the old token
    expect(secondAttempt).toBeNull();
  });

  it("rejects an unknown token", async () => {
    const result = await rotateRefreshToken("this-token-was-never-issued");
    expect(result).toBeNull();
  });

  it("rejects an expired token", async () => {
    const rawToken = await issueRefreshToken("client", newId());
    await RefreshToken.updateOne(
      { tokenHash: hashToken(rawToken) },
      { expiresAt: new Date(Date.now() - 1000) }, // already in the past
    );

    const result = await rotateRefreshToken(rawToken);
    expect(result).toBeNull();
  });
});

describe("revokeRefreshToken", () => {
  it("prevents a revoked token from being rotated (logout invalidates the session)", async () => {
    const rawToken = await issueRefreshToken("client", newId());
    await revokeRefreshToken(rawToken);

    const record = await RefreshToken.findOne({ tokenHash: hashToken(rawToken) });
    expect(record.revokedAt).toBeTruthy();

    const result = await rotateRefreshToken(rawToken);
    expect(result).toBeNull();
  });

  it("is a no-op (does not throw) for a token that was never issued", async () => {
    await expect(revokeRefreshToken("never-issued-token")).resolves.not.toThrow();
  });
});
