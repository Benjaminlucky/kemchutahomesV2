import * as Sentry from "@sentry/browser";

// Client-side error tracking (PRD FR-6). Same no-op-until-configured pattern
// as instrumentation.ts's server side — set NEXT_PUBLIC_SENTRY_DSN once a
// Sentry project exists and this starts reporting with no other code
// changes needed. Initialized here (not inline in instrumentation-client.ts)
// so app/error.tsx can import the same configured instance to report
// client-thrown errors that reach the route error boundary.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  tracesSampleRate: process.env.NEXT_PUBLIC_SENTRY_DSN ? 0.1 : 0,
});

export default Sentry;
