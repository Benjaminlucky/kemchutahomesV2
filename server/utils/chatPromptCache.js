/**
 * utils/chatPromptCache.js
 * ─────────────────────────────────────────────────────────────────────────────
 * In-memory cache for the AI chat system prompt (PRD FR-3: "chatbot system
 * prompt cached with TTL ≤ 5 min"). buildSystemPrompt() previously ran a full
 * Estate.find({}) plus KB and ROI reads on every single /api/chat message —
 * this cuts that to once per TTL window, invalidated immediately on writes
 * that change prompt content (estates, knowledge base, ROI settings) so admin
 * edits still show up right away instead of waiting out the TTL.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const TTL_MS = 5 * 60 * 1000;

let cachedPrompt = null;
let cachedAt = 0;

/**
 * Returns the cached prompt if fresh, otherwise calls `build` to produce a
 * new one and caches it. `build` is only invoked on a miss.
 */
export async function getCachedSystemPrompt(build) {
  const isFresh = cachedPrompt !== null && Date.now() - cachedAt < TTL_MS;
  if (isFresh) return cachedPrompt;

  cachedPrompt = await build();
  cachedAt = Date.now();
  return cachedPrompt;
}

/** Called from estate/knowledge-base/ROI write paths to force a rebuild on the next chat message. */
export function invalidateChatPromptCache() {
  cachedPrompt = null;
}
