// Thin wrapper around gtag for conversion events (PRD FR-6: "server-side
// events for inspection bookings and subscriptions (conversion tracking)").
// No-ops when GA4 isn't configured (NEXT_PUBLIC_GA_ID unset) or gtag hasn't
// loaded yet (e.g. the script is still fetching, or the user has a
// blocker) — callers never need to guard this themselves.
type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}
