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
  // TEMPORARY DIAGNOSTIC (remove once the realtor-dashboard-render bug is
  // found): Next.js redacts err.message for anything that crosses the
  // RSC boundary to a client error boundary (app/error.tsx included), and
  // this project has no paid Sentry access to see the real message either
  // way. onRequestError is the one place that still gets the raw,
  // unredacted error server-side — stash it so /api/debug/last-error can
  // hand it back on request instead of requiring Netlify log access.
  const g = globalThis as unknown as { __lastRenderError?: unknown };
  g.__lastRenderError = {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack?.slice(0, 2000) : undefined,
    digest: (err as { digest?: string })?.digest,
    path: request?.path,
    routeType: context?.routerKind,
    time: new Date().toISOString(),
  };

  if (!process.env.SENTRY_DSN) return;
  const Sentry = await import("@sentry/node");
  Sentry.captureException(err, { extra: { request, context } });
};
