// models/RefreshToken.model.js
import mongoose from "mongoose";

// Cookie auth, Phase 5 (PRD FR-4/§4.3): "short-lived JWT access token +
// rotating refresh token in httpOnly/Secure/SameSite=Lax cookies". Refresh
// tokens are opaque random strings, not JWTs — the DB record is the only
// source of truth, so revocation is an update, not a signature-verification
// question. Only the SHA-256 hash is ever stored; the raw token exists only
// in the httpOnly cookie on the client and briefly in memory server-side.
const RefreshTokenSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true, unique: true },
  principalType: {
    type: String,
    enum: ["admin", "realtor", "client"],
    required: true,
  },
  principalId: { type: mongoose.Schema.Types.ObjectId, required: true },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date, default: null },
  // Set when this token is exchanged at /api/auth/refresh for a new one —
  // rotation means a stolen-and-replayed old token is detectable (its
  // replacement already exists) even though it isn't independently
  // useless until it's also past expiresAt.
  replacedByTokenHash: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

RefreshTokenSchema.index({ principalType: 1, principalId: 1 });
// TTL index — Mongo auto-deletes the document once expiresAt passes,
// keeping the collection from growing unbounded with dead tokens.
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.RefreshToken ||
  mongoose.model("RefreshToken", RefreshTokenSchema);
