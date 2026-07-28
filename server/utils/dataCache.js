/**
 * utils/dataCache.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Generic in-memory TTL cache for read-heavy, rarely-written public data (PRD
 * FR-3: "knowledge base, ROI settings, and estate list cached in-memory ...
 * with write-through invalidation"). Generalizes the pattern already proven
 * by chatPromptCache.js — same get-or-build/invalidate shape, keyed so
 * multiple independent caches (knowledge base, ROI settings, branches, the
 * default estate list) can share one module instead of four near-identical
 * ones.
 *
 * Single-process only, same as chatPromptCache.js — fine for this app's
 * current one-instance deployment; would need a shared store (Redis) if the
 * API is ever horizontally scaled, at which point writes on one instance
 * wouldn't invalidate another's cache.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const store = new Map(); // key -> { value, cachedAt }

/**
 * Returns the cached value for `key` if still within `ttlMs`, otherwise
 * calls `build` to produce a fresh value and caches it. `build` is only
 * invoked on a miss/expiry.
 */
export async function getCached(key, ttlMs, build) {
  const entry = store.get(key);
  const isFresh = entry !== undefined && Date.now() - entry.cachedAt < ttlMs;
  if (isFresh) return entry.value;

  const value = await build();
  store.set(key, { value, cachedAt: Date.now() });
  return value;
}

/** Called from write paths to force a rebuild of a specific key on next read. */
export function invalidateCache(key) {
  store.delete(key);
}
