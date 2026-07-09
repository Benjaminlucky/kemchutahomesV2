/**
 * utils/sentry.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Error tracking (PRD FR-6: "Sentry on both tiers"). Sentry's Node SDK
 * disables itself and no-ops every call when `dsn` is falsy, so this file is
 * safe to import unconditionally — set SENTRY_DSN in the environment
 * whenever a Sentry project exists and reporting turns on with no other code
 * changes needed.
 *
 * Must be imported before any other instrumented module (index.js's very
 * first import, after config/env.js) — this is a Sentry Node SDK requirement
 * for its auto-instrumentation to attach correctly.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  tracesSampleRate: process.env.SENTRY_DSN ? 0.1 : 0,
});

export default Sentry;
