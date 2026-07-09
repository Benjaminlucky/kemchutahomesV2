/**
 * utils/revalidate.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Fires an on-demand ISR revalidation request to the Next.js app after a
 * write that affects cached public pages (estates, branches, knowledge
 * base) — PRD FR-3. Fire-and-forget: a slow or unreachable Next deployment
 * must never delay or fail the admin request that triggered it. If the
 * relevant env vars aren't set (e.g. local dev without the Next app
 * running), this is a silent no-op rather than an error.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const REVALIDATE_URL = process.env.NEXTJS_REVALIDATE_URL;
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

export function triggerRevalidate(tags) {
  if (!REVALIDATE_URL || !REVALIDATE_SECRET) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  fetch(`${REVALIDATE_URL}/api/revalidate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-revalidate-secret": REVALIDATE_SECRET,
    },
    body: JSON.stringify({ tags }),
    signal: controller.signal,
  })
    .then((res) => {
      if (!res.ok) console.warn("Revalidation request rejected:", res.status);
    })
    .catch((err) => console.warn("Revalidation request failed (non-fatal):", err.message))
    .finally(() => clearTimeout(timeout));
}
