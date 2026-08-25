import type { Instrumentation } from "next";

// Server-side error tracking (PRD FR-6: "Sentry on both tiers"). Sentry's
// Node SDK disables itself and no-ops every call when `dsn` is falsy, so
// this is safe to run unconditionally — set SENTRY_DSN in the environment
// whenever a Sentry project exists and reporting turns on with no other
// code changes needed.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const Sentry = await import("@sentry/node");
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || "development",
      tracesSampleRate: process.env.SENTRY_DSN ? 0.1 : 0,
    });
  }
}

// Captures server-rendering/route-handler errors — the same errors that
// surface to visitors via app/error.tsx — and reports them to Sentry.
export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context,
) => {
  if (!process.env.SENTRY_DSN) return;
  const Sentry = await import("@sentry/node");
  Sentry.captureException(err, { extra: { request, context } });
};
