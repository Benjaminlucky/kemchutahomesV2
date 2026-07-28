/**
 * utils/logger.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared pino instance (PRD FR-6: "pino structured logging" — Sentry already
 * covers exception tracking; this is for everything else: request/response
 * logs, startup/shutdown events, anything worth being able to grep/query as
 * JSON instead of scrolling raw console output). Used by both server
 * processes (index.js's web process and worker.js's cron process).
 *
 * Redacts anything that could leak a credential into log output — request
 * bodies routinely contain raw passwords (login/signup/reset endpoints) and
 * headers carry the session cookie/CSRF token.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.body.password",
      "req.body.confirmPassword",
      "req.body.currentPassword",
      "req.body.newPassword",
      "*.password",
      "*.passwordHash",
      "*.token",
    ],
    censor: "[redacted]",
  },
});

export default logger;
